$PgCtl = "C:\Users\USER\registry\scripts\..\.postgres_bin\pgsql\bin\pg_ctl.exe"
$DataDir = "C:\Users\USER\registry\scripts\..\postgres_data"
& $PgCtl stop -D "$DataDir" -m fast
Write-Host "Database stopped"
