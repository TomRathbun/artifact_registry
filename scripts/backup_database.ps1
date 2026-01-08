# Backup PostgreSQL database to SQL file
# This creates a dump that can be committed to git and restored on another machine

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = [System.IO.Path]::GetFullPath("$PSScriptRoot\..\..\registry-data\db_backups")
$backupFile = Join-Path $backupDir "registry_backup_$timestamp.sql"

Write-Host "Creating database backup..." -ForegroundColor Cyan
Write-Host "Target directory: $backupDir" -ForegroundColor Gray

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    Write-Host "Creating backup directory..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Path to pg_dump
$pgDump = [System.IO.Path]::GetFullPath("$PSScriptRoot\..\.postgres_bin\pgsql\bin\pg_dump.exe")

if (-not (Test-Path $pgDump)) {
    Write-Host "[ERROR] pg_dump.exe not found at: $pgDump" -ForegroundColor Red
    Write-Host "Please ensure you have run .\scripts\setup_db.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Running pg_dump..." -ForegroundColor Gray

# Run pg_dump using the portable PostgreSQL
& $pgDump `
    -h 127.0.0.1 `
    -p 5433 `
    -U admin `
    -d registry `
    -f "$backupFile" `
    --no-owner `
    --no-privileges `
    --clean `
    --if-exists `
    -w

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database backed up successfully to: $backupFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "To restore on another machine:" -ForegroundColor Yellow
    Write-Host "  1. Start PostgreSQL: .\start_db.ps1" -ForegroundColor Gray
    Write-Host "  2. Run: .\scripts\restore_database.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "File size: $((Get-Item $backupFile).Length / 1KB) KB" -ForegroundColor Cyan
}
else {
    Write-Host "[ERROR] Backup failed!" -ForegroundColor Red
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL is not running (run .\scripts\start_db.ps1)" -ForegroundColor Gray
    Write-Host "  - Port 5433 is blocked or incorrect" -ForegroundColor Gray
    Write-Host "  - Database 'registry' does not exist" -ForegroundColor Gray
    exit 1
}
