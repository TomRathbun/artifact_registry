@echo off
REM win_start_all.bat — start DB + backend + frontend (Windows)
echo Starting Artifact Registry (database, API, UI)...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\start_all.ps1"
if %ERRORLEVEL% neq 0 (
  echo.
  echo Failed to start. See messages above.
  pause
)
