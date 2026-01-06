# Backup PostgreSQL database to SQL file
# This creates a dump that can be committed to git and restored on another machine

$timestamp = Get-Date -Format "yyyy_MM_dd_HHmmss"
$backupDir = "$PSScriptRoot\..\..\registry-data\db_backups"
$backupFile = "$backupDir\registry_backup_$timestamp.sql"

Write-Host "Creating database backup..." -ForegroundColor Cyan

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Run pg_dump using the portable PostgreSQL
& "$PSScriptRoot\..\.postgres_bin\pgsql\bin\pg_dump.exe" `
    -h localhost `
    -p 5433 `
    -U admin `
    -d registry `
    -f $backupFile `
    --no-owner `
    --no-privileges `
    --clean `
    --if-exists

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database backed up successfully to: $backupFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "To restore on another machine:" -ForegroundColor Yellow
    Write-Host "  1. Start PostgreSQL: .\start_db.ps1" -ForegroundColor Gray
    Write-Host "  2. Run: .\restore_database.ps1 $backupFile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "File size: $((Get-Item $backupFile).Length / 1KB) KB" -ForegroundColor Cyan
}
else {
    Write-Host "[ERROR] Backup failed!" -ForegroundColor Red
    exit 1
}
