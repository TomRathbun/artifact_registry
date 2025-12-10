# Drop and recreate the registry database
# This gives you a fresh start

Write-Host "Dropping and recreating registry database..." -ForegroundColor Cyan

# Terminate all connections
& "$PSScriptRoot\..\.postgres_bin\pgsql\bin\psql.exe" `
    -h localhost `
    -p 5432 `
    -U admin `
    -d postgres `
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'registry' AND pid <> pg_backend_pid();"

# Drop database
& "$PSScriptRoot\..\.postgres_bin\pgsql\bin\psql.exe" `
    -h localhost `
    -p 5432 `
    -U admin `
    -d postgres `
    -c "DROP DATABASE IF EXISTS registry;"

# Create database
& "$PSScriptRoot\..\.postgres_bin\pgsql\bin\psql.exe" `
    -h localhost `
    -p 5432 `
    -U admin `
    -d postgres `
    -c "CREATE DATABASE registry;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database dropped and recreated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart the backend server" -ForegroundColor Gray
    Write-Host "  2. The database will be empty - you can restore from backup or start fresh" -ForegroundColor Gray
}
else {
    Write-Host "✗ Failed to recreate database!" -ForegroundColor Red
    exit 1
}
