# start_all.ps1
# Start PostgreSQL, backend API, and Vite frontend in separate windows.
# Usage (from repo root):  .\scripts\start_all.ps1
#                          .\win_start_all.bat

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host ""
Write-Host "=== Artifact Registry: Start All ===" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host ""

# 1. Database
$PgCtl = Join-Path $Root ".postgres_bin\pgsql\bin\pg_ctl.exe"
$DataDir = Join-Path $Root "postgres_data"
if (Test-Path $PgCtl) {
    $status = & $PgCtl status -D $DataDir 2>&1 | Out-String
    if ($status -match "server is running") {
        Write-Host "[OK] PostgreSQL already running on port 5433" -ForegroundColor Green
    }
    else {
        Write-Host "[..] Starting PostgreSQL..." -ForegroundColor Yellow
        & (Join-Path $Root "scripts\start_db.ps1")
        Start-Sleep -Seconds 2
        Write-Host "[OK] PostgreSQL started" -ForegroundColor Green
    }
}
else {
    Write-Host "[!!] Portable PostgreSQL not found at .postgres_bin — start your DB manually." -ForegroundColor Yellow
}

# 2. Backend (new window)
$BackendCmd = @"
Set-Location '$Root'
Write-Host 'Artifact Registry Backend — http://127.0.0.1:8000' -ForegroundColor Cyan
Write-Host 'Reload ignores frontend/node_modules (npm upgrades will not restart the API).' -ForegroundColor DarkGray
& '$Root\scripts\win_backend.ps1'
"@
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $BackendCmd
)
Write-Host "[OK] Backend window launched (port 8000)" -ForegroundColor Green

# 3. Frontend (new window)
$FrontendCmd = @"
Set-Location '$Root\frontend'
Write-Host 'Artifact Registry Frontend — http://127.0.0.1:5173' -ForegroundColor Cyan
if (-not (Test-Path 'node_modules')) { npm install }
npm run dev -- --host 127.0.0.1 --port 5173
"@
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $FrontendCmd
)
Write-Host "[OK] Frontend window launched (port 5173)" -ForegroundColor Green

Write-Host ""
Write-Host "Open the UI at:  http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host "API docs at:     http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the backend/frontend PowerShell windows to stop those services." -ForegroundColor Gray
Write-Host "Stop the database with:  .\win_stop_db.bat" -ForegroundColor Gray
Write-Host ""
