@echo off
REM win_install.bat
REM Optimized Windows installer for Artifact Registry.
REM This script bypasses PowerShell's execution policy for the current session.

echo ----------------------------------------------------
echo Artifact Registry: Automated Windows Installation
echo ----------------------------------------------------

powershell -ExecutionPolicy Bypass -File ".\full_install.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ----------------------------------------------------
    echo ERROR: Installation failed.
    echo Please check the output above for details.
    echo ----------------------------------------------------
    pause
) else (
    echo.
    echo ----------------------------------------------------
    echo SUCCESS: Installation completed.
    echo ----------------------------------------------------
    pause
)
