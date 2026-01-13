# win_backend.ps1
# Specialized runner for Windows to prevent reload storms and database resets.
# This script excludes the virtual environment from being watched for changes.

Write-Host "Starting Artifact Registry Backend with optimized reload settings..." -ForegroundColor Cyan

# Use --reload-exclude to ignore the .venv directory
# This prevents hundreds of file change events when packages are updated.
uv run uvicorn artifact_registry:app --reload --reload-exclude ".venv" --host 127.0.0.1 --port 8000
