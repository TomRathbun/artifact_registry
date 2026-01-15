@echo off
REM win_start_db.bat
REM Database startup wrapper for Artifact Registry.
REM This script bypasses PowerShell's execution policy for the current session.

echo Starting Local PostgreSQL Database...
powershell -ExecutionPolicy Bypass -File ".\scripts\start_db.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo Database failed to start.
    pause
)
