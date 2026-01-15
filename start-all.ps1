# Start All Services - Opens 3 separate PowerShell windows
Write-Host "🚀 Starting All Services..." -ForegroundColor Cyan
Write-Host ""
Write-Host "This will open 3 separate terminal windows:" -ForegroundColor Yellow
Write-Host "  1. Civic-AI (FastAPI) on port 8000" -ForegroundColor White
Write-Host "  2. Backend Server (Express) on port 3000" -ForegroundColor White
Write-Host "  3. Frontend Client (React) on port 5173" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Get the current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Civic-AI in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; .\start-civic-ai.ps1"

# Wait a bit
Start-Sleep -Seconds 2

# Start Server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; .\start-server.ps1"

# Wait a bit
Start-Sleep -Seconds 2

# Start Client in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; .\start-client.ps1"

Write-Host ""
Write-Host "✅ All services are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor Cyan
Write-Host "  • Civic-AI: http://localhost:8000" -ForegroundColor White
Write-Host "  • Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Close the terminal windows to stop the services." -ForegroundColor Yellow
