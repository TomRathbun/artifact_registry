# Restore PostgreSQL database from SQL backup file
# Usage: .\restore_database.ps1 <backup_file>

param(
    [Parameter(Mandatory = $false)]
    [string]$BackupFile
)

# If no file specified, use the most recent backup
if (-not $BackupFile) {
    $latestBackup = Get-ChildItem "db_backups\*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestBackup) {
        $BackupFile = $latestBackup.FullName
        Write-Host "Using latest backup: $($latestBackup.Name)" -ForegroundColor Cyan
    }
    else {
        Write-Host "✗ No backup files found in db_backups\" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $BackupFile)) {
    Write-Host "✗ Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "Restoring database from: $BackupFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will replace all data in the database!" -ForegroundColor Yellow
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Restore cancelled." -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "Restoring database..." -ForegroundColor Cyan

# Run psql to restore the dump
& ".\.postgres_bin\pgsql\bin\psql.exe" `
    -h localhost `
    -p 5432 `
    -U admin `
    -d registry `
    -f $BackupFile `
    -q

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database restored successfully!" -ForegroundColor Green
}
else {
    Write-Host "✗ Restore failed!" -ForegroundColor Red
    exit 1
}
