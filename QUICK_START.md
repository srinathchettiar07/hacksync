# 🚀 Quick Start Guide - Civic-AI

## TL;DR - Get Civic-AI Running in 3 Steps

### Step 1: Install Dependencies
```powershell
cd civic-ai
pip install -r requirements.txt
```
⏱️ Takes 5-10 minutes (downloads ~500MB model)

### Step 2: Test It
```powershell
python test.py
```
✅ Should show: `Predicted: [category], Confidence: [0.XX]`

### Step 3: Start Server
```powershell
uvicorn ai_service:app --reload --port 8000
```
🌐 Server runs at: http://localhost:8000

---

## 📋 What It Does

Classifies civic issue images into:
- 🕳️ Pothole
- 🗑️ Garbage
- 💡 Streetlight
- 🌊 Waterlogging
- 📦 Other

---

## 🧪 Test the API

**Health Check:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000"
```

**Classify Image:**
```powershell
curl -X POST "http://localhost:8000/classify" -F "file=@images/ph4.jpg"
```

---

## 📁 Project Structure

```
civic-ai/
├── ai_service.py       ← Main FastAPI app (START HERE)
├── test.py             ← Quick test script
├── requirements.txt    ← Python dependencies
├── images/             ← Test images
└── Node_back/          ← Node.js integration
```

---

## 🔗 Integration

Your Node.js backend (`Node_back/routes/report.js`) expects:
- FastAPI running at: `http://127.0.0.1:8000`
- Endpoint: `POST /classify`

---

## ⚠️ Troubleshooting

**"ModuleNotFoundError"** → Run `pip install -r requirements.txt`

**"Port in use"** → Change port: `--port 8001`

**"Out of memory"** → CLIP needs ~2GB RAM

---

## 📚 Full Documentation

- `civic-ai/README.md` - Detailed docs
- `civic-ai/SETUP_GUIDE.md` - Setup guide
- `PROJECT_ANALYSIS.md` - Full project overview
- `CIVIC_AI_STATUS.md` - Status report

---

## ✅ Checklist

- [ ] Install dependencies
- [ ] Test with `python test.py`
- [ ] Start server with `uvicorn`
- [ ] Test API endpoint
- [ ] Verify integration with Node.js backend

