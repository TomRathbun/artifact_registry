@echo off
REM win_run_backend.bat
REM Optimized backend runner for Artifact Registry.
REM This script bypasses PowerShell's execution policy for the current session.

echo Starting Artifact Registry Backend...
powershell -ExecutionPolicy Bypass -File ".\scripts\win_backend.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo Backend crashed or failed to start.
    pause
)
