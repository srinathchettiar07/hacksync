import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

const documentAnalysisRoute = express.Router();

// Multer setup for document upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDFs and images
    const allowedTypes = /pdf|jpeg|jpg|png|bmp|tiff|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed!"));
    }
  }
});

/**
 * POST /analyze-document
 * Upload a document (PDF or image) and extract metadata using OCR and Gemini API
 */
documentAnalysisRoute.post(
  "/analyze-document",
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No document file provided"
        });
      }

      const file = req.file;

      // Create form data for FastAPI service
      const form = new FormData();
      form.append(
        "file",
        Buffer.from(file.buffer),
        {
          filename: file.originalname || "document.pdf",
          contentType: file.mimetype,
          knownLength: file.size,
        }
      );

      // Call FastAPI document analysis service
      try {
        const aiResponse = await axios.post(
          process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/analyze-document",
          form,
          { 
            headers: form.getHeaders(),
            timeout: 120000 // 2 minute timeout for large documents
          }
        );

        const result = aiResponse.data;

        if (result.success) {
          return res.status(200).json({
            success: true,
            message: "Document analyzed successfully",
            data: {
              metadata: result.metadata,
              extracted_text_length: result.text_length,
              extracted_text_preview: result.extracted_text, // First 5000 chars
              filename: file.originalname,
              file_size: file.size,
              file_type: file.mimetype
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            error: result.error || "Failed to analyze document",
            data: result
          });
        }
      } catch (aiError) {
        console.error("Document analysis API error:", aiError?.response?.data || aiError?.message);
        
        return res.status(500).json({
          success: false,
          error: "Document analysis service error",
          details: aiError?.response?.data?.error || aiError?.message || "Unknown error"
        });
      }
    } catch (error) {
      console.error("Document analysis route error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message
      });
    }
  }
);

export default documentAnalysisRoute;

