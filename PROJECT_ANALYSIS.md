# HackSync Project Analysis

## Project Overview

This is a civic issue reporting and management system with AI-powered image classification capabilities. The project consists of three main components:

1. **civic-ai**: FastAPI service for image classification using CLIP model
2. **server**: Node.js/Express backend API
3. **client**: React frontend application

---

## 📁 Project Structure

```
hacksync/
├── civic-ai/              # AI Image Classification Service (Python/FastAPI)
│   ├── ai_service.py      # Main FastAPI application
│   ├── test.py            # Test script for image classification
│   ├── requirements.txt   # Python dependencies
│   ├── images/            # Sample test images
│   └── Node_back/         # Node.js integration layer
│       ├── models/Report.js
│       └── routes/report.js
│
├── server/                # Main Backend API (Node.js/Express)
│   ├── index.js           # Main server entry point
│   ├── Config/            # MongoDB configuration
│   ├── controllers/       # Business logic
│   ├── models/            # MongoDB models
│   ├── Routes/            # API routes
│   └── Utils/             # Utility functions
│
└── client/                # Frontend (React/Vite)
    ├── src/
    │   ├── Component/     # React components
    │   │   ├── Auth/      # Authentication components
    │   │   ├── Citizen/   # Citizen dashboard
    │   │   ├── Staff/     # Staff/admin components
    │   │   └── Department/
    │   └── Context/        # React context
    └── package.json
```

---

## 🤖 Civic-AI Service

### Purpose
The civic-ai service uses OpenAI's CLIP (Contrastive Language-Image Pre-training) model to automatically classify civic issues from uploaded images.

### Categories
- **Pothole**: Road surface damage
- **Garbage**: Waste management issues
- **Streetlight**: Street lighting problems
- **Waterlogging**: Flooding/drainage issues
- **Other**: Miscellaneous issues

### Technology Stack
- **Framework**: FastAPI
- **ML Model**: OpenAI CLIP (Vision-Language Model)
- **Image Processing**: PIL (Pillow)
- **Deep Learning**: PyTorch + Transformers

### Current Status
✅ **Code Structure**: Well-organized
✅ **API Endpoints**: Defined and functional
⚠️ **Dependencies**: Need to be installed
❓ **Runtime Status**: Needs testing

### Files
- `ai_service.py`: Main FastAPI application with `/` and `/classify` endpoints
- `test.py`: Standalone test script for image classification
- `Node_back/`: Integration layer for Node.js backend

---

## 🖥️ Server (Backend API)

### Purpose
Main backend API handling:
- User authentication (Citizens & Staff)
- Complaint management
- Department assignment
- Worker management
- Notifications
- Admin operations

### Technology Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **File Upload**: Multer
- **Authentication**: JWT
- **Other**: Socket.io, Cloudinary, Nodemailer

### Port
- **Default**: 3000

### Key Features
- Citizen authentication & registration
- Staff authentication & management
- Complaint CRUD operations
- Department management
- Worker assignment
- Auto-assignment based on category
- Notification system
- Real-time updates (Socket.io)

### Current Status
✅ **Code Structure**: Well-organized with MVC pattern
✅ **Routes**: Comprehensive API routes defined
⚠️ **Dependencies**: Need verification
❓ **MongoDB Connection**: Needs configuration

---

## 💻 Client (Frontend)

### Purpose
React-based frontend for:
- Citizen complaint filing
- Staff/admin dashboards
- Department management
- Real-time notifications

### Technology Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Charts**: Chart.js, Recharts
- **Maps**: Leaflet
- **Real-time**: Socket.io Client
- **UI**: Framer Motion, Lucide React

### Current Status
✅ **Structure**: Modern React setup
✅ **Components**: Comprehensive component library
⚠️ **Dependencies**: Need verification

---

## 🔗 Integration Flow

```
User Uploads Image
    ↓
Client (React)
    ↓
Server (Express) - Receives image via multer
    ↓
Server calls civic-ai FastAPI service
    ↓
civic-ai classifies image using CLIP
    ↓
Returns category + confidence
    ↓
Server saves to MongoDB
    ↓
Returns response to Client
```

---

## 🚀 How to Run

### 1. Civic-AI Service

```bash
# Navigate to civic-ai directory
cd civic-ai

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn ai_service:app --reload --port 8000
```

**Access**: http://localhost:8000

### 2. Server (Backend)

```bash
# Navigate to server directory
cd server

# Install Node.js dependencies
npm install

# Configure MongoDB connection in Config/mongoConnect.js

# Start the server
npm run dev
```

**Access**: http://localhost:3000

### 3. Client (Frontend)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access**: http://localhost:5173 (default Vite port)

---

## 📋 Prerequisites

### For Civic-AI:
- Python 3.8+
- pip
- ~2GB RAM (for CLIP model)
- Internet connection (first run downloads model)

### For Server:
- Node.js 18+
- npm
- MongoDB instance (local or cloud)
- MongoDB connection string

### For Client:
- Node.js 18+
- npm

---

## 🧪 Testing Civic-AI

### Method 1: Using test.py
```bash
cd civic-ai
python test.py
```

### Method 2: Using API
```bash
# Start the service first
uvicorn ai_service:app --reload --port 8000

# In another terminal, test with curl
curl -X POST "http://localhost:8000/classify" -F "file=@images/ph4.jpg"
```

### Method 3: Using Python requests
```python
import requests

url = "http://localhost:8000/classify"
with open("images/ph4.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)
    print(response.json())
```

---

## ⚠️ Known Issues & Notes

1. **civic-ai dependencies**: Need to install Python packages
2. **MongoDB connection**: Server needs MongoDB connection string configured
3. **Port conflicts**: Ensure ports 8000, 3000, and 5173 are available
4. **Model download**: First run of civic-ai will download ~500MB CLIP model
5. **Memory**: CLIP model requires significant RAM (~2GB)
6. **Node_back integration**: The Node_back routes need to be integrated with main server

---

## 🔍 Next Steps

1. ✅ Install civic-ai dependencies
2. ✅ Test civic-ai service
3. ⚠️ Configure MongoDB connection
4. ⚠️ Test server endpoints
5. ⚠️ Test client application
6. ⚠️ Verify integration between all components

---

## 📝 API Endpoints Summary

### Civic-AI (Port 8000)
- `GET /` - Health check
- `POST /classify` - Classify image

### Server (Port 3000)
- `/auth/citizen/*` - Citizen authentication
- `/auth/staff/*` - Staff authentication
- `/complaints/*` - Complaint management
- `/admin/*` - Admin operations
- `/notifications/*` - Notification system
- `/citizen/*` - Citizen operations

---

## 🎯 Project Status Summary

| Component | Code Status | Dependencies | Runtime Status |
|-----------|------------|--------------|----------------|
| civic-ai  | ✅ Complete | ⚠️ Need install | ❓ Untested |
| server    | ✅ Complete | ⚠️ Need verify | ❓ Untested |
| client    | ✅ Complete | ⚠️ Need verify | ❓ Untested |

---

## 📚 Documentation Files

- `civic-ai/README.md` - Detailed civic-ai documentation
- `PROJECT_ANALYSIS.md` - This file (overview)

