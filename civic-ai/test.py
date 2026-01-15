from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

# Load CLIP model & processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

categories = ["pothole", "garbage", "streetlight", "waterlogging", "other"]

def classify_image(img_path):
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


label, conf = classify_image("images/ph4.jpg")
print(f"Predicted: {label}, Confidence: {conf:.2f}")