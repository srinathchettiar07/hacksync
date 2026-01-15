# HackSync - Test All Services Script
# This script tests if all services are running

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allRunning = $true

# Test Civic-AI
Write-Host "Testing Civic-AI (port 8000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Civic-AI: Running" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Civic-AI: Not running" -ForegroundColor Red
    Write-Host "   Start with: cd civic-ai && uvicorn ai_service:app --reload --port 8000" -ForegroundColor Yellow
    $allRunning = $false
}

Write-Host ""

# Test Backend
Write-Host "Testing Backend (port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ Backend: Running (responded)" -ForegroundColor Green
} catch {
    # Backend might not have a root route, so check if port is open
    $connection = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        Write-Host "✅ Backend: Port 3000 is open" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend: Not running" -ForegroundColor Red
        Write-Host "   Start with: cd server && npm run dev" -ForegroundColor Yellow
        $allRunning = $false
    }
}

Write-Host ""

# Test Frontend
Write-Host "Testing Frontend (port 5173)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: Not running" -ForegroundColor Red
    Write-Host "   Start with: cd client && npm run dev" -ForegroundColor Yellow
    $allRunning = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allRunning) {
    Write-Host "✅ All services are running!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some services are not running. See instructions above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For setup instructions, see RUN_EVERYTHING.md" -ForegroundColor Cyan
}

Write-Host ""

