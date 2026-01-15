# 🤖 AI Usage & Testing Guide

## 📍 When is the AI Used?

The AI (civic-ai FastAPI service) is **automatically triggered** when:

1. **A citizen files a complaint** through the React frontend
2. **The complaint includes at least one image**
3. **The image is uploaded** via the "File a Complaint" form

### Flow Diagram:
```
User uploads image → React Frontend → Express Server → FastAPI AI Service → Category Prediction → Saved to Database
```

---

## 🔄 How It Works (Step-by-Step)

### 1. User Action (Frontend)
- User goes to **"File a Complaint"** page (`/citizen/portal/file-complaint`)
- User uploads images (up to 5 images)
- User fills description and location
- User clicks **"Submit Report"**

### 2. Server Processing (`server/Routes/CitizenR/citizenRoutes.js`)
When the server receives the complaint at `/citizen/send-complain`:

```javascript
// Line 42-73: AI Classification happens here
if (req.files && req.files.length > 0) {
  const firstImage = req.files[0];
  
  // Send to FastAPI classifier
  const aiResponse = await axios.post(
    "http://127.0.0.1:8000/classify",  // ← AI Service
    formData,
    { headers: form.getHeaders() }
  );
  
  // Get predicted category
  const predicted = aiResponse?.data?.predicted_category;
  // Maps: pothole → "Pothole", garbage → "Garbage", etc.
  resolvedCategory = categoryMap[predicted] || "Other";
}
```

### 3. AI Service (FastAPI)
- Receives image at `http://127.0.0.1:8000/classify`
- Uses CLIP model to classify image
- Returns: `{ predicted_category: "pothole", confidence: 0.85 }`

### 4. Category Mapping
The server maps AI predictions to your database categories:
- `pothole` → `"Pothole"`
- `garbage` → `"Garbage"`
- `streetlight` → `"Streetlight"`
- `waterlogging` → `"Water"`
- `other` → `"Other"`

### 5. Complaint Saved
- Complaint is saved with AI-determined category
- Images uploaded to Cloudinary
- Response sent back to frontend

---

## 🧪 How to Test if AI is Working

### Method 1: Test the Complete Flow (End-to-End)

**Prerequisites:**
1. ✅ All 3 services running:
   - Civic-AI: `http://localhost:8000`
   - Server: `http://localhost:3000`
   - Client: `http://localhost:5173`

**Steps:**
1. **Start all services:**
   ```powershell
   .\start-all.ps1
   ```

2. **Open React app:** http://localhost:5173

3. **Login as Citizen** (or register if needed)

4. **Navigate to "File a Complaint"** page

5. **Upload a test image:**
   - Use images from `civic-ai/images/` folder
   - Or use any image showing:
     - Pothole (road damage)
     - Garbage (waste)
     - Streetlight (lighting)
     - Waterlogging (flooding)

6. **Fill in description and location**

7. **Submit the complaint**

8. **Check the result:**
   - The complaint should be saved with AI-determined category
   - Check server terminal for AI response logs
   - Check browser console for any errors

---

### Method 2: Test AI Service Directly

**Test the FastAPI service independently:**

```powershell
# 1. Start civic-ai service
cd civic-ai
uvicorn ai_service:app --reload --port 8000

# 2. In another terminal, test with curl
curl -X POST "http://localhost:8000/classify" -F "file=@images/ph4.jpg"
```

**Expected Response:**
```json
{
  "predicted_category": "pothole",
  "confidence": 0.85
}
```

---

### Method 3: Test Using Python Script

```powershell
cd civic-ai
python test.py
```

**Expected Output:**
```
Predicted: pothole, Confidence: 0.85
```

---

### Method 4: Check Server Logs

When you submit a complaint with an image, check the **server terminal**:

**✅ Success Logs:**
```
AI classification successful
Predicted category: pothole
Complaint saved with category: Pothole
```

**❌ Error Logs:**
```
AI classification failed, defaulting to Other: [error message]
```

**Common Errors:**
- `ECONNREFUSED` → FastAPI service not running
- `ETIMEDOUT` → FastAPI service not accessible
- `Network Error` → Check if port 8000 is accessible

---

## 🔍 Verification Checklist

### ✅ Is AI Service Running?
```powershell
# Check if service responds
Invoke-WebRequest -Uri "http://localhost:8000"
```

**Expected:** `{"message": "Civic Issue Classification API is running 🚀"}`

### ✅ Is Server Connected to AI?
Check server terminal when submitting complaint:
- Look for: `AI classification successful`
- Or: `AI classification failed`

### ✅ Is Category Being Set?
After submitting complaint:
1. Check database or dashboard
2. Complaint should have category (not "Other" if image was clear)
3. Check server response: `aiCategory: "Pothole"` (or other category)

---

## 🐛 Troubleshooting

### Issue: AI Not Being Called

**Symptoms:**
- Complaints always saved as "Other"
- No AI logs in server terminal

**Solutions:**
1. **Check if FastAPI is running:**
   ```powershell
   # Visit in browser
   http://localhost:8000
   ```

2. **Check server code:**
   - Verify `server/Routes/CitizenR/citizenRoutes.js` line 61
   - Should be: `"http://127.0.0.1:8000/classify"`

3. **Check if images are being uploaded:**
   - Server logs should show file received
   - Check `req.files` is not empty

---

### Issue: AI Returns Errors

**Symptoms:**
- Server logs show: `AI classification failed`
- Error: `ECONNREFUSED` or `ETIMEDOUT`

**Solutions:**
1. **Start FastAPI service:**
   ```powershell
   cd civic-ai
   uvicorn ai_service:app --reload --port 8000
   ```

2. **Check port 8000 is free:**
   ```powershell
   netstat -ano | findstr :8000
   ```

3. **Test AI service directly:**
   ```powershell
   curl http://localhost:8000
   ```

---

### Issue: Wrong Categories Predicted

**Symptoms:**
- AI predicts wrong category
- Low confidence scores

**Solutions:**
1. **Use clearer images:**
   - Well-lit photos
   - Focused on the issue
   - Single issue per image

2. **Check image quality:**
   - Minimum resolution: 224x224 pixels
   - Supported formats: JPG, PNG, WEBP

3. **Note:** CLIP model accuracy depends on image quality
   - First image is used for classification
   - Upload best image first

---

## 📊 Testing Different Categories

### Test Images Available:
Located in `civic-ai/images/`:

- **Pothole:** `ph2.jpg`, `ph4.jpg`, `ph5.jpg`
- **Streetlight:** `Series-H-street-lamp-light-on-city-road-in-Saudi-Arabia-1024x683.webp`
- **Garbage:** Use any waste/garbage image
- **Waterlogging:** Use flooding/water image

### Expected Results:

| Image Type | Expected Category | Confidence Range |
|------------|------------------|------------------|
| Pothole | `pothole` → `"Pothole"` | 0.6 - 0.9 |
| Garbage | `garbage` → `"Garbage"` | 0.5 - 0.8 |
| Streetlight | `streetlight` → `"Streetlight"` | 0.7 - 0.9 |
| Waterlogging | `waterlogging` → `"Water"` | 0.6 - 0.8 |

---

## 🎯 Quick Test Script

Create a test file `test-ai-integration.js`:

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testAI() {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('civic-ai/images/ph4.jpg'));
  
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/classify',
      formData,
      { headers: formData.getHeaders() }
    );
    
    console.log('✅ AI Response:', response.data);
    console.log('Category:', response.data.predicted_category);
    console.log('Confidence:', response.data.confidence);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAI();
```

Run it:
```powershell
node test-ai-integration.js
```

---

## 📝 Summary

**AI is used when:**
- ✅ Citizen files complaint with image
- ✅ Image is uploaded via frontend
- ✅ Server automatically calls FastAPI service

**To verify it's working:**
1. ✅ Check FastAPI service is running (`http://localhost:8000`)
2. ✅ Submit complaint with image via frontend
3. ✅ Check server logs for AI response
4. ✅ Verify complaint category is set (not "Other")

**Key Files:**
- **AI Service:** `civic-ai/ai_service.py`
- **Integration:** `server/Routes/CitizenR/citizenRoutes.js` (lines 42-73)
- **Frontend:** `client/src/Component/Citizen/FileAComplaint.jsx`

---

## 🚀 Quick Start Testing

```powershell
# 1. Start all services
.\start-all.ps1

# 2. Test AI directly
cd civic-ai
python test.py

# 3. Test via frontend
# Open http://localhost:5173
# Login → File Complaint → Upload image → Submit
# Check category in dashboard
```

That's it! The AI automatically classifies images when complaints are filed. 🎉

