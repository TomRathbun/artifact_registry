# Restore PostgreSQL database from SQL backup file
# Usage: .\restore_database.ps1 <backup_file>

param(
    [Parameter(Mandatory = $false)]
    [string]$BackupFile
)

# Target directory for backups
$backupDir = [System.IO.Path]::GetFullPath("$PSScriptRoot\..\..\registry-data\db_backups")

# If no file specified, use the most recent backup
if (-not $BackupFile) {
    Write-Host "Searching for latest backup in: $backupDir" -ForegroundColor Gray
    if (Test-Path $backupDir) {
        $latestBackup = Get-ChildItem "$backupDir\*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestBackup) {
            $BackupFile = $latestBackup.FullName
            Write-Host "Using latest backup: $($latestBackup.Name)" -ForegroundColor Cyan
        }
        else {
            Write-Host "✗ No .sql backup files found in $backupDir" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "✗ Backup directory not found: $backupDir" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $BackupFile)) {
    Write-Host "✗ Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "Restoring database from: $BackupFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will replace all data in the 'registry' database!" -ForegroundColor Yellow
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Restore cancelled." -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "Restoring database..." -ForegroundColor Cyan

# Path to psql
$psql = [System.IO.Path]::GetFullPath("$PSScriptRoot\..\.postgres_bin\pgsql\bin\psql.exe")

if (-not (Test-Path $psql)) {
    Write-Host "✗ psql.exe not found at: $psql" -ForegroundColor Red
    exit 1
}

# Run psql to restore the dump
& $psql `
    -h 127.0.0.1 `
    -p 5433 `
    -U admin `
    -d registry `
    -f "$BackupFile" `
    -q `
    -w

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database restored successfully!" -ForegroundColor Green
}
else {
    Write-Host "✗ Restore failed!" -ForegroundColor Red
    exit 1
}
