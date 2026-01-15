# Install All Dependencies
Write-Host "📦 Installing All Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install Civic-AI dependencies
Write-Host "1️⃣  Installing Civic-AI Python dependencies..." -ForegroundColor Yellow
Set-Location -Path "civic-ai"
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Civic-AI dependencies" -ForegroundColor Red
} else {
    Write-Host "✅ Civic-AI dependencies installed" -ForegroundColor Green
}
Write-Host ""

# Install Server dependencies
Write-Host "2️⃣  Installing Server Node.js dependencies..." -ForegroundColor Yellow
Set-Location -Path "..\server"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Server dependencies" -ForegroundColor Red
} else {
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
}
Write-Host ""

# Install Client dependencies
Write-Host "3️⃣  Installing Client Node.js dependencies..." -ForegroundColor Yellow
Set-Location -Path "..\client"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Client dependencies" -ForegroundColor Red
} else {
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
}
Write-Host ""

# Return to root
Set-Location -Path ".."

Write-Host "🎉 All dependencies installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  • Run .\start-all.ps1 to start all services" -ForegroundColor White
Write-Host "  • Or run each service individually:" -ForegroundColor White
Write-Host "    - .\start-civic-ai.ps1" -ForegroundColor White
Write-Host "    - .\start-server.ps1" -ForegroundColor White
Write-Host "    - .\start-client.ps1" -ForegroundColor White

