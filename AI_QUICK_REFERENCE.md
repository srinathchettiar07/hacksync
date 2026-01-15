# 🤖 AI Quick Reference

## ⚡ When is AI Used?

**Automatically** when a citizen files a complaint **with an image** via the frontend.

---

## 🔄 Flow

```
User Uploads Image
    ↓
React Frontend (FileAComplaint.jsx)
    ↓
POST /citizen/send-complain
    ↓
Express Server (citizenRoutes.js)
    ↓
Calls FastAPI: http://127.0.0.1:8000/classify
    ↓
AI Returns: { predicted_category: "pothole", confidence: 0.85 }
    ↓
Server Maps: pothole → "Pothole"
    ↓
Complaint Saved with Category
```

---

## ✅ How to Check if It's Working

### 1. Is AI Service Running?
```powershell
Invoke-WebRequest -Uri "http://localhost:8000"
```
Should return: `{"message": "Civic Issue Classification API is running 🚀"}`

### 2. Test Directly
```powershell
cd civic-ai
python test.py
```

### 3. Test via Frontend
1. Start all services: `.\start-all.ps1`
2. Open: http://localhost:5173
3. Login → File Complaint → Upload image → Submit
4. Check category in dashboard (should not be "Other")

### 4. Check Server Logs
When submitting complaint, server terminal should show:
- ✅ `AI classification successful` → Working!
- ❌ `AI classification failed` → Check FastAPI service

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `civic-ai/ai_service.py` | FastAPI AI service |
| `server/Routes/CitizenR/citizenRoutes.js` | Integration point (line 42-73) |
| `client/src/Component/Citizen/FileAComplaint.jsx` | Frontend form |

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| AI not called | Start FastAPI: `uvicorn ai_service:app --reload --port 8000` |
| Always "Other" | Check FastAPI is running and accessible |
| Connection refused | Verify port 8000 is free and service is running |

---

## 📊 Categories

AI predicts → Server maps to:
- `pothole` → `"Pothole"`
- `garbage` → `"Garbage"`
- `streetlight` → `"Streetlight"`
- `waterlogging` → `"Water"`
- `other` → `"Other"`

---

## 🧪 Quick Test

```powershell
# Test AI service
node test-ai-integration.js

# Or use Python
cd civic-ai
python test.py
```

---

**Full Guide:** See `AI_USAGE_AND_TESTING.md` for detailed documentation.

