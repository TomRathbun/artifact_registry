@echo off
REM win_stop_db.bat
REM Database shutdown wrapper for Artifact Registry.
REM This script bypasses PowerShell's execution policy for the current session.

echo Stopping Local PostgreSQL Database...
powershell -ExecutionPolicy Bypass -File ".\scripts\stop_db.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo Database failed to stop or already stopped.
    pause
)
