# Script to set Gemini API Key
param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "Setting GEMINI_API_KEY environment variable..." -ForegroundColor Cyan

# Set for current session
$env:GEMINI_API_KEY = $ApiKey

# Verify it's set
if ($env:GEMINI_API_KEY) {
    Write-Host "✅ GEMINI_API_KEY set successfully for this session" -ForegroundColor Green
    Write-Host "   Note: This will only last for the current PowerShell session" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   To set it permanently:" -ForegroundColor Cyan
    Write-Host "   1. Right-click 'This PC' → Properties → Advanced System Settings" -ForegroundColor White
    Write-Host "   2. Click 'Environment Variables'" -ForegroundColor White
    Write-Host "   3. Under 'User variables', click 'New'" -ForegroundColor White
    Write-Host "   4. Variable name: GEMINI_API_KEY" -ForegroundColor White
    Write-Host "   5. Variable value: $ApiKey" -ForegroundColor White
} else {
    Write-Host "❌ Failed to set GEMINI_API_KEY" -ForegroundColor Red
}

