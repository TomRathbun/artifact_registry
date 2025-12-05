$PgCtl = "C:\Users\USER\registry\scripts\..\.postgres_bin\pgsql\bin\pg_ctl.exe"
$DataDir = "C:\Users\USER\registry\scripts\..\postgres_data"
& $PgCtl start -D "$DataDir" -l "$DataDir\logfile"
Write-Host "Database started on port 5432"
