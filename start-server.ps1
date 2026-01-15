# Start Backend Server (Node.js/Express)
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to server directory
Set-Location -Path "server"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not found. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Starting Express server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev

