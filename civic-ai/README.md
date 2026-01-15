# Civic-AI Service

A FastAPI-based service that uses OpenAI's CLIP model to classify civic issues from images.

## Features

- **Image Classification**: Classifies civic issues into categories:
  - Pothole
  - Garbage
  - Streetlight
  - Waterlogging
  - Other

- **REST API**: Provides a simple POST endpoint to upload and classify images

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Navigate to the civic-ai directory:
```bash
cd civic-ai
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

**Note**: The first time you run this, it will download the CLIP model (~500MB), which may take a few minutes.

## Running the Service

### Start the FastAPI server:

```bash
uvicorn ai_service:app --reload --port 8000
```

The service will be available at: `http://localhost:8000`

### Check if it's running:

Visit `http://localhost:8000` in your browser or use:
```bash
curl http://localhost:8000
```

You should see: `{"message": "Civic Issue Classification API is running 🚀"}`

## Usage

### API Endpoints

#### 1. Health Check
- **GET** `/`
- Returns a simple status message

#### 2. Classify Image
- **POST** `/classify`
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field containing the image

### Example Usage

#### Using cURL:
```bash
curl -X POST "http://localhost:8000/classify" \
  -F "file=@images/ph4.jpg"
```

#### Using Python:
```python
import requests

url = "http://localhost:8000/classify"
with open("images/ph4.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)
    print(response.json())
```

#### Using JavaScript/Node.js:
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const formData = new FormData();
formData.append('file', fs.createReadStream('images/ph4.jpg'));

axios.post('http://localhost:8000/classify', formData, {
  headers: formData.getHeaders()
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

### Response Format:
```json
{
  "predicted_category": "pothole",
  "confidence": 0.85
}
```

## Testing

You can test the service using the provided `test.py` script:

```bash
python test.py
```

This will classify the image at `images/ph4.jpg` and print the results.

## Integration with Node.js Backend

The `Node_back` directory contains Express.js routes that integrate with this FastAPI service. The Node.js backend:

1. Receives image uploads via multer
2. Forwards them to this FastAPI service at `http://127.0.0.1:8000/classify`
3. Stores the results in MongoDB

Make sure both services are running:
- FastAPI service: `http://localhost:8000`
- Node.js backend: Configured to call the FastAPI service

## Troubleshooting

1. **Model download takes time**: First run will download the CLIP model (~500MB). Be patient.

2. **Port already in use**: Change the port in the uvicorn command:
   ```bash
   uvicorn ai_service:app --reload --port 8001
   ```

3. **Memory issues**: CLIP model requires ~2GB RAM. Close other applications if needed.

4. **Dependencies not found**: Make sure you're in a virtual environment and have installed requirements.txt

## Project Structure

```
civic-ai/
├── ai_service.py          # FastAPI service (main file)
├── test.py                # Test script
├── requirements.txt       # Python dependencies
├── images/                # Sample images for testing
├── Node_back/             # Node.js backend integration
│   ├── models/
│   │   └── Report.js      # MongoDB model
│   └── routes/
│       └── report.js      # Express routes
└── README.md             # This file
```

