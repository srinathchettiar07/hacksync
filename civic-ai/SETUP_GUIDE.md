# Civic-AI Setup and Testing Guide

## Quick Start

### Step 1: Install Dependencies

Open PowerShell or Command Prompt and run:

```powershell
# Navigate to civic-ai directory
cd civic-ai

# Install Python dependencies
pip install -r requirements.txt
```

**Note**: This will install:
- FastAPI and Uvicorn (web framework)
- Transformers and PyTorch (ML libraries)
- Pillow (image processing)

**First-time installation**: The CLIP model (~500MB) will be downloaded automatically on first use.

### Step 2: Test the Service

#### Option A: Quick Test (using test.py)
```powershell
python test.py
```

This will classify `images/ph4.jpg` and show the result.

#### Option B: Start the API Server
```powershell
# Start the FastAPI server
uvicorn ai_service:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### Option C: Test the API Endpoint

With the server running, open another terminal and test:

**Using PowerShell:**
```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:8000" | Select-Object -ExpandProperty Content

# Test classification (requires curl or Invoke-WebRequest)
curl -X POST "http://localhost:8000/classify" -F "file=@images/ph4.jpg"
```

**Using Python:**
```python
import requests

# Test health
response = requests.get("http://localhost:8000")
print(response.json())

# Test classification
with open("images/ph4.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:8000/classify", files=files)
    print(response.json())
```

### Step 3: Expected Output

**Health Check Response:**
```json
{
  "message": "Civic Issue Classification API is running 🚀"
}
```

**Classification Response:**
```json
{
  "predicted_category": "pothole",
  "confidence": 0.85
}
```

## Troubleshooting

### Issue: ModuleNotFoundError
**Solution**: Install dependencies:
```powershell
pip install -r requirements.txt
```

### Issue: Port 8000 already in use
**Solution**: Use a different port:
```powershell
uvicorn ai_service:app --reload --port 8001
```

### Issue: Model download fails
**Solution**: 
- Check internet connection
- The model downloads automatically on first use
- It's ~500MB, so be patient

### Issue: Out of memory
**Solution**: 
- Close other applications
- CLIP model requires ~2GB RAM
- Consider using a smaller model variant

### Issue: Image file not found
**Solution**: 
- Make sure test images exist in `images/` folder
- Check file paths in test scripts

## Integration with Node.js Backend

The Node.js backend (`Node_back/routes/report.js`) expects the FastAPI service to be running at:
```
http://127.0.0.1:8000/classify
```

Make sure:
1. FastAPI service is running on port 8000
2. Node.js backend can reach `http://127.0.0.1:8000`
3. CORS is enabled (already configured in `ai_service.py`)

## Testing Different Images

You can test with any image in the `images/` folder:
- `ph2.jpg`, `ph4.jpg`, `ph5.jpg` - Pothole examples
- `photo1.jpg`, `photo2.jpg`, `photo3.jpg` - Various issues
- `Series-H-street-lamp-light-on-city-road-in-Saudi-Arabia-1024x683.webp` - Streetlight example

## Performance Notes

- **First request**: Slower (model loading)
- **Subsequent requests**: Faster (~1-2 seconds per image)
- **Model size**: ~500MB (downloaded once)
- **Memory usage**: ~2GB RAM recommended

## Next Steps

Once the service is running:
1. ✅ Test with `test.py`
2. ✅ Start the API server
3. ✅ Test API endpoints
4. ✅ Integrate with Node.js backend
5. ✅ Test end-to-end flow

