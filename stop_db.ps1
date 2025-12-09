$PgCtl = "$PSScriptRoot\.postgres_bin\pgsql\bin\pg_ctl.exe"
$DataDir = "$PSScriptRoot\postgres_data"
& $PgCtl stop -D "$DataDir" -m fast
Write-Host "Database stopped"
