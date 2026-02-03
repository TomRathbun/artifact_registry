$PgCtl = "$PSScriptRoot\..\.postgres_bin\pgsql\bin\pg_ctl.exe"
$DataDir = "$PSScriptRoot\..\postgres_data"
$PidFile = "$DataDir\postmaster.pid"

# Handle stale PID files
if (Test-Path $PidFile) {
    $pidValue = (Get-Content $PidFile -TotalCount 1).Trim()
    if ($pidValue -match '^\d+$') {
        $process = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
        if (-not $process) {
            Write-Host "Detected stale PID file ($pidValue). Cleaning up..." -ForegroundColor Yellow
            Remove-Item $PidFile -Force
        }
    }
    else {
        # File is corrupt or in unexpected format, remove it
        Write-Host "Detected invalid PID file. Cleaning up..." -ForegroundColor Yellow
        Remove-Item $PidFile -Force
    }
}

# Start database
& $PgCtl start -D "$DataDir" -l "$DataDir\logfile" -o "-p 5433"
Write-Host "Database started on port 5433"
