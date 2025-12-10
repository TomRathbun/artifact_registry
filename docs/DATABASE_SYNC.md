# Database Sync Guide

This guide explains how to sync your artifact registry database between home and work.

## Quick Start

### Export Database (at home)
```bash
python sync_database.py export
```
This creates a backup file in `db_backups/` directory.

### Transfer File
Copy the `.dump` file to your work computer (via USB drive, cloud storage, etc.)

### Import Database (at work)
```bash
python sync_database.py import db_backups/artifact_registry_YYYYMMDD_HHMMSS.dump
```

## Commands

### Export
```bash
# Export with auto-generated filename
python sync_database.py export

# Export to specific file
python sync_database.py export -o my_backup.dump
```

### Import
```bash
# Import and replace existing data (recommended)
python sync_database.py import backup.dump

# Import without dropping existing tables (merge mode)
python sync_database.py import backup.dump --no-clean
```

### List Backups
```bash
python sync_database.py list
```

## Alternative Methods

### 1. **Manual pg_dump/pg_restore**
```bash
# Export
pg_dump -h localhost -U postgres -d artifact_registry -F c -f backup.dump

# Import
pg_restore -h localhost -U postgres -d artifact_registry -c backup.dump
```

### 2. **SQL Format (more readable)**
```bash
# Export as SQL
pg_dump -h localhost -U postgres -d artifact_registry -f backup.sql

# Import SQL
psql -h localhost -U postgres -d artifact_registry < backup.sql
```

### 3. **Data Only (no schema)**
```bash
# Export data only
pg_dump -h localhost -U postgres -d artifact_registry -a -f data_only.sql

# Import data only
psql -h localhost -U postgres -d artifact_registry < data_only.sql
```

### 4. **Specific Tables**
```bash
# Export specific tables
pg_dump -h localhost -U postgres -d artifact_registry -t needs -t requirements -f partial.dump

# Import
pg_restore -h localhost -U postgres -d artifact_registry partial.dump
```

## Cloud Sync Options

### Option A: Git LFS (for small databases)
1. Add `.dump` files to Git LFS
2. Push/pull to sync

### Option B: Cloud Storage
1. Export database
2. Upload to Dropbox/Google Drive/OneDrive
3. Download on other computer
4. Import

### Option C: PostgreSQL Replication (advanced)
For real-time sync, you can set up PostgreSQL streaming replication, but this requires both databases to be accessible over the network.

## File Uploads Sync

Don't forget to sync the `uploads/` directory as well:
```bash
# Copy uploads folder
cp -r uploads/ /path/to/backup/uploads/
```

Or add to `.gitignore` exception if files are small enough.

## Troubleshooting

### "role does not exist" error
Make sure PostgreSQL user exists:
```bash
psql -U postgres -c "CREATE USER postgres WITH PASSWORD 'postgres';"
```

### "database does not exist" error
Create the database first:
```bash
psql -U postgres -c "CREATE DATABASE artifact_registry;"
```

### Permission denied
Run with sudo or check PostgreSQL permissions:
```bash
sudo -u postgres pg_dump ...
```

## Automation

### Daily Auto-Backup (Windows Task Scheduler)
Create a scheduled task to run:
```bash
python C:\Users\USER\registry\sync_database.py export
```

### Daily Auto-Backup (Linux/Mac cron)
```bash
0 2 * * * cd /path/to/registry && python sync_database.py export
```

## Best Practices

1. **Export before making major changes**
2. **Keep multiple backups** (the script auto-timestamps them)
3. **Test imports** on a copy first if unsure
4. **Sync uploads folder** along with database
5. **Use version control** for code, database dumps for data
