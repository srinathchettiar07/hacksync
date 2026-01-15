"""
Document Analysis Service
Processes government PDFs and images to extract key metadata using OCR and Gemini API
"""

import os
import json
from typing import Dict, List, Optional
import tempfile

# Try to load from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

# Configure Gemini API - will be set via environment variable
def get_gemini_api_key():
    """Get Gemini API key from environment variable"""
    return os.getenv("GEMINI_API_KEY", "")

def configure_gemini():
    """Configure Gemini API if key is available"""
    api_key = get_gemini_api_key()
    if api_key and GEMINI_AVAILABLE:
        try:
            genai.configure(api_key=api_key)
            return True
        except Exception as e:
            print(f"Error configuring Gemini: {e}")
            return False
    return False

# Try to configure on module load
configure_gemini()


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image using pytesseract OCR
    """
    if not PYTESSERACT_AVAILABLE or not PIL_AVAILABLE:
        return ""
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, lang='eng')
        return text
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return ""


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF using PyMuPDF (fitz) for better accuracy
    """
    if PYMUPDF_AVAILABLE:
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += page.get_text()
            doc.close()
            
            # If PyMuPDF extraction is poor, try OCR on images
            if len(text.strip()) < 100 and PDF2IMAGE_AVAILABLE and PYTESSERACT_AVAILABLE:
                try:
                    images = convert_from_path(pdf_path, dpi=300)
                    ocr_text = ""
                    for img in images:
                        ocr_text += pytesseract.image_to_string(img, lang='eng') + "\n"
                    return ocr_text if len(ocr_text) > len(text) else text
                except Exception:
                    pass
            
            return text
        except Exception as e:
            print(f"Error extracting text from PDF with PyMuPDF: {e}")
    
    # Fallback to OCR on images
    if PDF2IMAGE_AVAILABLE and PYTESSERACT_AVAILABLE:
        try:
            images = convert_from_path(pdf_path, dpi=300)
            text = ""
            for img in images:
                text += pytesseract.image_to_string(img, lang='eng') + "\n"
            return text
        except Exception as e:
            print(f"Error in OCR fallback: {e}")
    
    return ""


def extract_metadata_with_gemini(text: str) -> Dict:
    """
    Use Gemini API to extract structured metadata from extracted text
    """
    if not GEMINI_AVAILABLE:
        return {
            "error": "Google Generative AI library not installed. Please install google-generativeai."
        }
    
    # Check for API key dynamically
    api_key = get_gemini_api_key()
    if not api_key:
        return {
            "error": "Gemini API key not configured. Please set GEMINI_API_KEY environment variable before starting the service. Example: set GEMINI_API_KEY=your-key-here (Windows) or export GEMINI_API_KEY=your-key-here (Linux/Mac)"
        }
    
    # Configure Gemini with the key
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        return {
            "error": f"Failed to configure Gemini API: {str(e)}"
        }
    
    def _pick_supported_model_name() -> str:
        """
        Pick a model that supports generateContent for the current API key.
        This avoids hardcoding model names that may not exist for a given account/region.
        """
        models = list(genai.list_models())

        supported = []
        for m in models:
            name = getattr(m, "name", None)
            methods = getattr(m, "supported_generation_methods", None) or []
            if name and ("generateContent" in methods):
                supported.append(name)

        if not supported:
            available_names = [getattr(m, "name", None) for m in models]
            available_names = [n for n in available_names if n]
            raise RuntimeError(
                "No Gemini models available for generateContent on this API key. "
                f"Available models: {available_names[:25]}"
            )

        # Prefer Gemini models if present; otherwise return the first supported model.
        preference_substrings = ["gemini-2", "gemini-1.5", "gemini-1.0", "gemini"]
        for pref in preference_substrings:
            for name in supported:
                if pref in name:
                    return name

        return supported[0]

    try:
        model_name = _pick_supported_model_name()
        model = genai.GenerativeModel(model_name)
        
        prompt = f"""
You are a document analysis system for government documents. Extract the following information from the provided text and return it as a JSON object.

Extract:
1. Project Name: The name or title of the project
2. Budget: The budget amount (in currency, e.g., "₹50,000" or "50,000 INR" or "50 lakh")
3. Construction Details: Any construction-related information (location, type, specifications)
4. Department: The government department or agency mentioned
5. Timeline: Project timeline, deadlines, or duration
6. Location: Project location or address
7. Contractor: Name of contractor or company if mentioned
8. Status: Project status (approved, pending, completed, etc.)

Text to analyze:
{text[:10000]}

Return ONLY a valid JSON object with these keys (use null for missing values):
{{
    "project_name": "...",
    "budget": "...",
    "construction_details": "...",
    "department": "...",
    "timeline": "...",
    "location": "...",
    "contractor": "...",
    "status": "...",
    "additional_info": "..."
}}
"""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up response - remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON response
        metadata = json.loads(response_text)
        return metadata
        
    except json.JSONDecodeError as e:
        print(f"Error parsing Gemini response as JSON: {e}")
        response_preview = response_text[:500] if 'response_text' in locals() else "No response text available"
        print(f"Response was: {response_preview}")
        return {
            "error": "Failed to parse AI response as JSON",
            "raw_response": response_preview
        }
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        error_message = str(e)
        return {
            "error": f"Gemini API error: {error_message}"
        }


def analyze_document(file_path: str, file_type: str) -> Dict:
    """
    Main function to analyze a document (PDF or image)
    
    Args:
        file_path: Path to the document file
        file_type: 'pdf' or 'image'
    
    Returns:
        Dictionary containing extracted text and metadata
    """
    try:
        # Extract text based on file type
        if file_type.lower() == 'pdf':
            extracted_text = extract_text_from_pdf(file_path)
        elif file_type.lower() in ['image', 'jpg', 'jpeg', 'png']:
            extracted_text = extract_text_from_image(file_path)
        else:
            return {
                "error": f"Unsupported file type: {file_type}"
            }
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            return {
                "error": "Could not extract sufficient text from document. The document may be too low quality or empty.",
                "extracted_text_length": len(extracted_text) if extracted_text else 0
            }
        
        # Extract metadata using Gemini
        metadata = extract_metadata_with_gemini(extracted_text)
        
        return {
            "success": True,
            "extracted_text": extracted_text[:5000],  # Return first 5000 chars
            "text_length": len(extracted_text),
            "metadata": metadata
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error analyzing document: {str(e)}"
        }

