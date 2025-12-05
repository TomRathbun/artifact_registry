$ErrorActionPreference = "Stop"

$PgUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.2-1-windows-x64-binaries.zip"
$InstallDir = "$PSScriptRoot\..\.postgres_bin"
$DataDir = "$PSScriptRoot\..\postgres_data"
$ZipFile = "$PSScriptRoot\..\postgresql.zip"

Write-Host "Setting up PostgreSQL Portable..."

# 1. Download
if (-not (Test-Path $InstallDir)) {
    if (-not (Test-Path $ZipFile)) {
        Write-Host "Downloading PostgreSQL from $PgUrl..."
        Invoke-WebRequest -Uri $PgUrl -OutFile $ZipFile
    }
    
    # 2. Extract
    Write-Host "Extracting to $InstallDir..."
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Expand-Archive -Path $ZipFile -DestinationPath $InstallDir -Force
    
    # Cleanup Zip
    Remove-Item $ZipFile
} else {
    Write-Host "PostgreSQL binaries already present."
}

# 3. Initialize Data Directory
$InitDb = "$InstallDir\pgsql\bin\initdb.exe"
if (-not (Test-Path $DataDir)) {
    Write-Host "Initializing Database in $DataDir..."
    & $InitDb -D "$DataDir" -U admin -A trust -E UTF8 --no-locale
} else {
    Write-Host "Data directory already exists."
}

# 4. Create Start Script
$StartScript = "$PSScriptRoot\..\start_db.ps1"
$PgCtl = "$InstallDir\pgsql\bin\pg_ctl.exe"
$StartContent = @"
`$PgCtl = "$PgCtl"
`$DataDir = "$DataDir"
& `$PgCtl start -D "`$DataDir" -l "`$DataDir\logfile"
Write-Host "Database started on port 5432"
"@
Set-Content -Path $StartScript -Value $StartContent

# 5. Create Stop Script
$StopScript = "$PSScriptRoot\..\stop_db.ps1"
$StopContent = @"
`$PgCtl = "$PgCtl"
`$DataDir = "$DataDir"
& `$PgCtl stop -D "`$DataDir" -m fast
Write-Host "Database stopped"
"@
Set-Content -Path $StopScript -Value $StopContent

Write-Host "Setup Complete!"
Write-Host "Run .\start_db.ps1 to start the database server."
