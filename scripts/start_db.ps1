$PgCtl = "$PSScriptRoot\..\.postgres_bin\pgsql\bin\pg_ctl.exe"
$DataDir = "$PSScriptRoot\..\postgres_data"
& $PgCtl start -D "$DataDir" -l "$DataDir\logfile" -o "-p 5432"
Write-Host "Database started on port 5432"
