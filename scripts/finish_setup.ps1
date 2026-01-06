$ErrorActionPreference = "Stop"

Write-Host "Starting Database..."
& "$PSScriptRoot\..\start_db.ps1"

Write-Host "Waiting for DB startup..."
Start-Sleep -Seconds 5

$BinDir = "$PSScriptRoot\..\.postgres_bin\pgsql\bin"
$CreateDb = "$BinDir\createdb.exe"

Write-Host "Creating 'registry' database..."
try {
    & $CreateDb -U admin -h localhost -p 5433 registry
}
catch {
    Write-Host "Database 'registry' might already exist or failed to create. Continuing..."
}

Write-Host "Running Data Migration..."
python "$PSScriptRoot\migrate_sqlite_to_pg.py"

Write-Host "Setup and Migration Complete!"
