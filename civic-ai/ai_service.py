from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
from document_analysis import analyze_document
import os

# Initialize FastAPI app
app = FastAPI(title="Civic Issue Classifier", description="Classify civic issues from images", version="1.0")

# Allow CORS (so your frontend/backend can call this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Define categories
categories = ["pothole", "garbage", "streetlight", "waterlogging", "other"]

@app.get("/")
def root():
    return {"message": "Civic Issue Classification API is running 🚀"}

@app.get("/check-gemini")
def check_gemini():
    """Check if Gemini API key is configured"""
    from document_analysis import get_gemini_api_key, GEMINI_AVAILABLE
    api_key = get_gemini_api_key()
    return {
        "gemini_available": GEMINI_AVAILABLE,
        "api_key_configured": bool(api_key),
        "message": "Gemini API key is configured" if api_key else "Gemini API key is NOT configured. Please set GEMINI_API_KEY environment variable."
    }

@app.get("/list-models")
def list_models():
    """
    List available Google Generative AI models for this API key and which ones support generateContent.
    Useful for debugging 'model not found' errors.
    """
    from document_analysis import get_gemini_api_key, GEMINI_AVAILABLE
    if not GEMINI_AVAILABLE:
        return {"success": False, "error": "google-generativeai is not installed"}

    api_key = get_gemini_api_key()
    if not api_key:
        return {"success": False, "error": "GEMINI_API_KEY is not configured"}

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        models = list(genai.list_models())
        data = []
        for m in models:
            name = getattr(m, "name", None)
            methods = getattr(m, "supported_generation_methods", None) or []
            data.append(
                {
                    "name": name,
                    "supported_generation_methods": list(methods),
                    "supports_generateContent": "generateContent" in methods,
                }
            )
        return {"success": True, "count": len(data), "models": data}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def classify_image(img_path):
    image = Image.open(img_path).convert("RGB")
    
    inputs = processor(
        text=categories,
        images=image,
        return_tensors="pt",
        padding=True
    )
    
    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1).detach().cpu().numpy()[0]
    
    # Get top prediction
    best_idx = probs.argmax()
    return categories[best_idx], float(probs[best_idx])

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        # Use your function
        label, confidence = await classify_image(temp_path)

        return {"predicted_category": label, "confidence": confidence}
    finally:
        # Clean up temporary file
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/analyze-document")
async def analyze_document_endpoint(file: UploadFile = File(...)):
    """
    Analyze government documents (PDF or images) to extract metadata
    such as project name, budget, construction details, etc.
    """
    # Determine file type
    filename = file.filename.lower()
    if filename.endswith('.pdf'):
        file_type = 'pdf'
    elif filename.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp')):
        file_type = 'image'
    else:
        return {
            "success": False,
            "error": f"Unsupported file type. Please upload a PDF or image file."
        }
    
    # Save uploaded file temporarily
    temp_path = f"temp_doc_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyze document
        result = analyze_document(temp_path, file_type)
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error processing document: {str(e)}"
        }
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
   