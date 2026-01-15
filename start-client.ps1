# Start Frontend Client (React/Vite)
Write-Host "🚀 Starting Frontend Client..." -ForegroundColor Cyan
Write-Host ""

# Navigate to client directory
Set-Location -Path "client"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not found. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Starting Vite dev server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the client
npm run dev

