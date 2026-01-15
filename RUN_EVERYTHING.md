# ⚡ Run Everything - Quick Reference

## 🎯 Fastest Way (Using Scripts)

### First Time Setup:
```powershell
.\install-all.ps1
```

### Start Everything:
```powershell
.\start-all.ps1
```

This opens 3 terminal windows automatically!

---

## 📝 Manual Method (3 Terminal Windows)

### Terminal 1 - Civic-AI:
```powershell
cd civic-ai
pip install -r requirements.txt  # First time only
uvicorn ai_service:app --reload --port 8000
```

### Terminal 2 - Server:
```powershell
cd server
npm install  # First time only
npm run dev
```

### Terminal 3 - Client:
```powershell
cd client
npm install  # First time only
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Status Check |
|---------|-----|--------------|
| **Frontend** | http://localhost:5173 | Open in browser |
| **Backend API** | http://localhost:3000 | Check terminal |
| **AI Service** | http://localhost:8000 | Open in browser |

---

## ✅ Quick Verification

1. **Civic-AI**: Visit http://localhost:8000 → Should see status message
2. **Server**: Check terminal → Should see "Server listening on port 3000"
3. **Client**: Visit http://localhost:5173 → Should see React app

---

## 🚨 Troubleshooting

**Port in use?** → Stop other services or change ports

**Module not found?** → Run `npm install` or `pip install -r requirements.txt`

**MongoDB error?** → Check `server/Config/mongoConnect.js` connection string

---

## 📚 Full Documentation

See `HOW_TO_RUN_EVERYTHING.md` for complete guide with troubleshooting.
