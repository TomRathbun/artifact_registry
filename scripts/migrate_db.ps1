$ErrorActionPreference = "Stop"

Write-Host "Running Database Migrations..."

# Check if .venv exists
if (Test-Path "$PSScriptRoot\..\.venv\Scripts\alembic.exe") {
    $Alembic = "$PSScriptRoot\..\.venv\Scripts\alembic.exe"
}
elseif (Test-Path "$PSScriptRoot\..\venv\Scripts\alembic.exe") {
    $Alembic = "$PSScriptRoot\..\venv\Scripts\alembic.exe"
}
else {
    Write-Warning "Could not find alembic in .venv or venv. Trying global PATH..."
    $Alembic = "alembic"
}

# Prefer uv so the project venv is always used
Set-Location (Join-Path $PSScriptRoot "..")
if (Get-Command uv -ErrorAction SilentlyContinue) {
    uv run python -m alembic upgrade head
}
else {
    & $Alembic upgrade head
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migrations applied successfully!" -ForegroundColor Green
}
else {
    Write-Error "Migration failed with exit code $LASTEXITCODE"
}
