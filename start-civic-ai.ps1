# Start Civic-AI Service (FastAPI)
Write-Host "🚀 Starting Civic-AI Service..." -ForegroundColor Cyan
Write-Host ""

# Check for Gemini API Key
if (-not $env:GEMINI_API_KEY) {
    Write-Host "⚠️  WARNING: GEMINI_API_KEY environment variable is not set!" -ForegroundColor Yellow
    Write-Host "   Document analysis will not work without it." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   To set it, run:" -ForegroundColor Cyan
    Write-Host "   `$env:GEMINI_API_KEY='your-api-key-here'" -ForegroundColor White
    Write-Host ""
    Write-Host "   Or set it permanently in System Environment Variables." -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "Do you want to continue anyway? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Exiting..." -ForegroundColor Red
        exit
    }
} else {
    Write-Host "✅ GEMINI_API_KEY found" -ForegroundColor Green
}

# Navigate to civic-ai directory
Set-Location -Path "civic-ai"

# Check if requirements are installed
Write-Host "Checking Python dependencies..." -ForegroundColor Yellow
try {
    python -c "import fastapi, transformers, torch, PIL" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Dependencies not found. Installing..." -ForegroundColor Yellow
        pip install -r requirements.txt
    } else {
        Write-Host "✅ Dependencies found" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the server
uvicorn ai_service:app --reload --port 8000

