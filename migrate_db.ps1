$ErrorActionPreference = "Stop"

Write-Host "Running Database Migrations..."

# Check if .venv exists
if (Test-Path ".\.venv\Scripts\alembic.exe") {
    $Alembic = ".\.venv\Scripts\alembic.exe"
}
elseif (Test-Path ".\venv\Scripts\alembic.exe") {
    $Alembic = ".\venv\Scripts\alembic.exe"
}
else {
    Write-Warning "Could not find alembic in .venv or venv. Trying global PATH..."
    $Alembic = "alembic"
}

# Run the migration
& $Alembic upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migrations applied successfully!" -ForegroundColor Green
}
else {
    Write-Error "Migration failed with exit code $LASTEXITCODE"
}
