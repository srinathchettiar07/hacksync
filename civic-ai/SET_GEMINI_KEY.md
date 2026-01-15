# Setting Gemini API Key

To use the document analysis feature, you need to set your Gemini API key.

## Quick Setup (Temporary - Current Session Only)

### Windows PowerShell:
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

### Windows Command Prompt:
```cmd
set GEMINI_API_KEY=your-api-key-here
```

### Linux/Mac:
```bash
export GEMINI_API_KEY="your-api-key-here"
```

## Permanent Setup (Recommended)

### Windows:
1. Right-click "This PC" → Properties → Advanced System Settings
2. Click "Environment Variables"
3. Under "User variables", click "New"
4. Variable name: `GEMINI_API_KEY`
5. Variable value: `your-api-key-here`
6. Click OK

### Using PowerShell Script:
```powershell
.\civic-ai\set_gemini_key.ps1 -ApiKey "your-api-key-here"
```

## Using .env File (Alternative)

Create a file named `.env` in the `civic-ai` folder:
```
GEMINI_API_KEY=your-api-key-here
```

## Get Your API Key

Visit: https://makersuite.google.com/app/apikey

## Verify It's Working

After setting the key and starting the service, check:
```powershell
# In browser or PowerShell:
Invoke-WebRequest -Uri "http://localhost:8000/check-gemini"
```

You should see:
```json
{
  "gemini_available": true,
  "api_key_configured": true,
  "message": "Gemini API key is configured"
}
```

