# win_backend.ps1
# Backend runner for Windows.
#
# IMPORTANT: Do not use shell globs like frontend/* in arguments.
# PowerShell expands them into thousands of paths before uvicorn runs.
#
# We only watch app/ for reload, so frontend/node_modules (katex .py files, etc.)
# never trigger API restarts during npm upgrades.

Write-Host "Starting Artifact Registry Backend with optimized reload settings..." -ForegroundColor Cyan
Write-Host "Reload watch directory: app\ only (frontend, .venv, node_modules ignored)" -ForegroundColor DarkGray

# --reload-dir app is enough: no exclude globs, no PowerShell expansion.
# Changes to root artifact_registry.py require a manual restart (rare).
$pythonArgs = @(
    '-m', 'uvicorn',
    'artifact_registry:app',
    '--reload',
    '--reload-dir', 'app',
    '--host', '127.0.0.1',
    '--port', '8000'
)

if (Test-Path '.\.venv\Scripts\python.exe') {
    & '.\.venv\Scripts\python.exe' @pythonArgs
}
else {
    uv run python @pythonArgs
}
