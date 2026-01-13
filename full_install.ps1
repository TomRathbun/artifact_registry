# full_install.ps1
# Automated Installation Script for Artifact Registry
# This script handles: Postgres Setup, Folders, .env, Dependencies, and Migrations.

$ErrorActionPreference = "Stop"
Write-Host "`n--- Artifact Registry: Automated Installation ---" -ForegroundColor Cyan

# 1. Prerequisite Checks
Write-Host "`n[1/6] Checking Prerequisites..." -ForegroundColor Yellow
$Prereqs = @("uv", "npm", "git")
foreach ($tool in $Prereqs) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "$tool is not installed. Please install it before continuing."
    }
    Write-Host "  ✓ $tool found"
}

# 2. Portable PostgreSQL Setup
Write-Host "`n[2/6] Initializing PostgreSQL environment..." -ForegroundColor Yellow
if (-not (Test-Path ".postgres_bin")) {
    .\scripts\setup_db.ps1
}
else {
    Write-Host "  Postgres binaries already present."
}

# 3. Create External Data Directories (Sibling Folder)
Write-Host "`n[3/6] Setting up external data storage (registry-data)..." -ForegroundColor Yellow
$DataRoot = Join-Path $PSScriptRoot "..\registry-data"
$Uploads = Join-Path $DataRoot "uploads"
$Backups = Join-Path $DataRoot "db_backups"

if (-not (Test-Path $DataRoot)) { New-Item -ItemType Directory -Path $DataRoot | Out-Null }
if (-not (Test-Path $Uploads)) { New-Item -ItemType Directory -Path $Uploads | Out-Null }
if (-not (Test-Path $Backups)) { New-Item -ItemType Directory -Path $Backups | Out-Null }
Write-Host "  ✓ Data folders created at: $DataRoot"

# 4. Generate Environment Configuration
Write-Host "`n[4/6] Configuring Environment Files (.env)..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    $Secret = [Guid]::NewGuid().ToString()
    $EnvContent = @"
DATABASE_URL=postgresql://admin@127.0.0.1:5433/registry
SECRET_KEY=$Secret
UPLOAD_DIR=../registry-data/uploads
BACKUP_DIR=../registry-data/db_backups
"@
    Set-Content -Path ".env" -Value $EnvContent
    Write-Host "  ✓ Generated backend .env"
}
else {
    Write-Host "  .env already exists, skipping generation."
}

if (-not (Test-Path "frontend/.env")) {
    Set-Content -Path "frontend/.env" -Value "VITE_API_BASE_URL=http://localhost:8000"
    Write-Host "  ✓ Generated frontend/.env"
}

# 5. Install Dependencies
Write-Host "`n[5/6] Installing Dependencies (this may take a few minutes)..." -ForegroundColor Yellow
Write-Host "  > Syncing Python environment (uv)..."
uv sync --frozen

Write-Host "  > Installing Frontend packages (npm)..."
Push-Location frontend
npm install --no-fund
Pop-Location

# 6. Database Initialization & Migration
Write-Host "`n[6/6] Finalizing Database..." -ForegroundColor Yellow
Write-Host "  > Starting Local PostgreSQL server..."
.\start_db.ps1
Start-Sleep -Seconds 5 # Wait for PG to initialize

# Create the 'registry' database if it doesn't exist
$PgBin = Join-Path $PSScriptRoot ".postgres_bin\pgsql\bin\createdb.exe"
& $PgBin -h localhost -p 5433 -U admin registry 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Registry database created."
}
else {
    Write-Host "  Registry database already exists or error ignored."
}

Write-Host "  > Running migrations..."
.\scripts\migrate_db.ps1

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "        INSTALLATION COMPLETE SUCCESSFULLY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`nTo start the application:"
Write-Host "  Terminal 1 (Backend):  .\scripts\win_backend.ps1" -ForegroundColor Gray
Write-Host "  Terminal 2 (Frontend): cd frontend; npm run dev" -ForegroundColor Gray
Write-Host "`nLogs and backups are stored in: $DataRoot"
Write-Host "================================================`n"
