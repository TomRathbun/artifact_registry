# Allow frontend and backend through Windows Firewall
# Run this as Administrator

Write-Host "Adding firewall rules for Artifact Registry..." -ForegroundColor Cyan

# Allow backend (port 8000)
New-NetFirewallRule -DisplayName "Artifact Registry Backend" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8000 `
    -Action Allow `
    -Profile Domain, Private

# Allow frontend (port 5173)
New-NetFirewallRule -DisplayName "Artifact Registry Frontend" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5173 `
    -Action Allow `
    -Profile Domain, Private

Write-Host "✓ Firewall rules added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now accessible on the network!" -ForegroundColor Yellow
Write-Host ""
Write-Host "To access from other computers:" -ForegroundColor Cyan
Write-Host "  1. Find your IP: ipconfig" -ForegroundColor Gray
Write-Host "  2. Share this URL: http://YOUR_IP:5173" -ForegroundColor Gray
Write-Host "     Example: http://192.168.1.100:5173" -ForegroundColor Gray
