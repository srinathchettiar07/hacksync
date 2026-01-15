# 🚀 How to Run Everything - Complete Guide

This guide will help you run all three components of your HackSync project:
1. **civic-ai** (FastAPI - Port 8000)
2. **server** (Node.js/Express - Port 3000)
3. **client** (React/Vite - Port 5173)

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Python 3.8+** installed
- ✅ **Node.js 18+** installed
- ✅ **npm** or **yarn** installed
- ✅ **Internet connection** (for downloading models and packages)
- ✅ **MongoDB connection** (already configured in `server/Config/mongoConnect.js`)

---

## 🎯 Quick Start (3 Terminal Windows)

You'll need **3 separate terminal windows** to run all services simultaneously.

### Terminal 1: Civic-AI Service (Python/FastAPI)

```powershell
# Navigate to civic-ai directory
cd civic-ai

# Install Python dependencies (only first time)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn ai_service:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**✅ Success Check:** Open http://localhost:8000 in browser

---

### Terminal 2: Backend Server (Node.js/Express)

```powershell
# Navigate to server directory
cd server

# Install Node.js dependencies (only first time)
npm install

# Start the server
npm run dev
```

**Expected Output:**
```
MongoDB Connected: [hostname]
Server listening on port 3000
```

**✅ Success Check:** Server should connect to MongoDB and listen on port 3000

---

### Terminal 3: Frontend Client (React/Vite)

```powershell
# Navigate to client directory
cd client

# Install Node.js dependencies (only first time)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Success Check:** Open http://localhost:5173 in browser

---

## 🔄 Running Order

**Recommended order:**
1. **First:** Start civic-ai (FastAPI service)
2. **Second:** Start server (Node.js backend)
3. **Third:** Start client (React frontend)

**Why this order?**
- Server depends on civic-ai for image classification
- Client depends on server for API calls

---

## 📊 Service Ports Summary

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **civic-ai** | 8000 | http://localhost:8000 | AI image classification |
| **server** | 3000 | http://localhost:3000 | Backend API |
| **client** | 5173 | http://localhost:5173 | Frontend UI |

---

## 🧪 Testing Each Service

### Test Civic-AI:
```powershell
# In civic-ai directory
python test.py
```

Or visit: http://localhost:8000

### Test Server:
```powershell
# Check if server is running
Invoke-WebRequest -Uri "http://localhost:3000"
```

### Test Client:
Just open: http://localhost:5173

---

## 🛠️ First-Time Setup (One-Time Only)

### 1. Install Civic-AI Dependencies
```powershell
cd civic-ai
pip install -r requirements.txt
```
⏱️ Takes 5-10 minutes (downloads CLIP model ~500MB)

### 2. Install Server Dependencies
```powershell
cd server
npm install
```
⏱️ Takes 1-2 minutes

### 3. Install Client Dependencies
```powershell
cd client
npm install
```
⏱️ Takes 2-3 minutes

---

## 🔧 Troubleshooting

### Issue: Port Already in Use

**Civic-AI (Port 8000):**
```powershell
uvicorn ai_service:app --reload --port 8001
```

**Server (Port 3000):**
Edit `server/index.js` and change `const port = 3000;` to another port

**Client (Port 5173):**
Vite will automatically use next available port, or specify:
```powershell
npm run dev -- --port 5174
```

---

### Issue: Module Not Found (Python)

```powershell
cd civic-ai
pip install -r requirements.txt
```

---

### Issue: Module Not Found (Node.js)

```powershell
# For server
cd server
npm install

# For client
cd client
npm install
```

---

### Issue: MongoDB Connection Failed

Check `server/Config/mongoConnect.js` - MongoDB connection string is already configured. If it fails:
1. Verify MongoDB Atlas connection string is correct
2. Check internet connection
3. Verify MongoDB cluster is running

---

### Issue: Civic-AI Service Not Responding

1. Make sure FastAPI is running: `uvicorn ai_service:app --reload --port 8000`
2. Check if port 8000 is accessible: http://localhost:8000
3. Verify Python dependencies are installed

---

## 🎬 Using the Startup Scripts

I've created PowerShell scripts to make this easier:

### Option 1: Run All Services (3 separate windows)
```powershell
# Run each script in separate terminal windows
.\start-civic-ai.ps1
.\start-server.ps1
.\start-client.ps1
```

### Option 2: Run Everything at Once
```powershell
.\start-all.ps1
```

---

## 📝 Daily Usage

Once everything is set up, you only need to:

1. **Open 3 terminal windows**
2. **Run each service** (no need to install dependencies again)
3. **Access the app** at http://localhost:5173

---

## 🔗 Integration Flow

```
User → Client (React) → Server (Express) → Civic-AI (FastAPI)
                                    ↓
                              MongoDB (Database)
```

**Example Flow:**
1. User uploads image in React app
2. React sends to Express server
3. Express forwards to FastAPI for classification
4. FastAPI returns category + confidence
5. Express saves to MongoDB
6. Express returns result to React
7. React displays result to user

---

## ✅ Verification Checklist

After starting all services, verify:

- [ ] Civic-AI: http://localhost:8000 shows status message
- [ ] Server: Terminal shows "Server listening on port 3000"
- [ ] Server: Terminal shows "MongoDB Connected"
- [ ] Client: Browser opens http://localhost:5173
- [ ] Client: No console errors in browser
- [ ] Integration: Can upload image and get classification

---

## 🚨 Common Issues

### "Cannot find module"
→ Run `npm install` or `pip install -r requirements.txt`

### "Port already in use"
→ Stop other services using that port or change port number

### "MongoDB connection failed"
→ Check internet connection and MongoDB Atlas credentials

### "FastAPI not responding"
→ Make sure civic-ai service is running on port 8000

---

## 📚 Additional Resources

- `civic-ai/README.md` - Civic-AI detailed docs
- `PROJECT_ANALYSIS.md` - Full project overview
- `QUICK_START.md` - Quick reference

---

## 💡 Pro Tips

1. **Use separate terminal windows** - Easier to see logs from each service
2. **Keep terminals open** - Closing stops the service
3. **Check ports first** - Make sure ports 8000, 3000, 5173 are free
4. **Start civic-ai first** - Server depends on it for image classification
5. **Use `--reload` flag** - Auto-restarts on code changes (development mode)

---

## 🎯 Summary

**To run everything:**

1. **Terminal 1:** `cd civic-ai` → `uvicorn ai_service:app --reload --port 8000`
2. **Terminal 2:** `cd server` → `npm run dev`
3. **Terminal 3:** `cd client` → `npm run dev`

**Then open:** http://localhost:5173

That's it! 🎉

