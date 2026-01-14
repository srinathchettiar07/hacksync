from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

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
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    # Use your function
    label, confidence = await classify_image(temp_path)

    return {"predicted_category": label, "confidence": confidence}
   