"""
Database backup and restore endpoints.
Provides full PostgreSQL database export/import functionality.
"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
import subprocess
import os
from pathlib import Path
from datetime import datetime
import tempfile

router = APIRouter()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "admin")
DB_NAME = os.getenv("DB_NAME", "registry")
BACKUP_DIR = Path("db_backups")
BACKUP_DIR.mkdir(exist_ok=True)

# Path to portable PostgreSQL binaries
PG_BIN_DIR = Path(".postgres_bin/pgsql/bin")
PG_DUMP = PG_BIN_DIR / "pg_dump.exe" if os.name == 'nt' else PG_BIN_DIR / "pg_dump"
PG_RESTORE = PG_BIN_DIR / "pg_restore.exe" if os.name == 'nt' else PG_BIN_DIR / "pg_restore"

@router.get("/backup")
async def backup_database():
    """
    Export full database as a PostgreSQL dump file.
    Returns the dump file for download.
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"registry_backup_{timestamp}.dump"
        filepath = BACKUP_DIR / filename
        
        # Run pg_dump
        cmd = [
            str(PG_DUMP),
            "-h", DB_HOST,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-F", "c",  # Custom format (compressed)
            "-f", str(filepath)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "postgres")}
        )
        
        if result.returncode != 0:
            raise Exception(f"pg_dump failed: {result.stderr}")
        
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type="application/octet-stream"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@router.post("/restore")
async def restore_database(request: Request):
    """
    Restore database from uploaded dump file.
    WARNING: This will overwrite the current database!
    """
    try:
        # Read the raw bytes from request body
        file_bytes = await request.body()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".dump") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        
        try:
            # First, drop and recreate the database to ensure clean state
            # This avoids foreign key constraint issues
            drop_cmd = [
                str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
                "-h", DB_HOST,
                "-U", DB_USER,
                "-d", "postgres",  # Connect to postgres database
                "-c", f"DROP DATABASE IF EXISTS {DB_NAME}; CREATE DATABASE {DB_NAME};"
            ]
            
            drop_result = subprocess.run(
                drop_cmd,
                capture_output=True,
                text=True,
                env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "")}
            )
            
            if drop_result.returncode != 0:
                raise Exception(f"Failed to recreate database: {drop_result.stderr}")
            
            # Now restore into the clean database
            cmd = [
                str(PG_RESTORE),
                "-h", DB_HOST,
                "-U", DB_USER,
                "-d", DB_NAME,
                tmp_path
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "")}
            )
            
            # Note: pg_restore may return non-zero even on success due to warnings
            # Check if there are actual errors
            if "ERROR" in result.stderr and "already exists" not in result.stderr:
                raise Exception(f"pg_restore failed: {result.stderr}")
            
            return {"message": "Database restored successfully", "warnings": result.stderr if result.stderr else None}
            
        finally:
            # Clean up temp file
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@router.get("/backups")
async def list_backups():
    """
    List available backup files.
    """
    try:
        backups = []
        for backup_file in sorted(BACKUP_DIR.glob("*.dump"), reverse=True):
            backups.append({
                "filename": backup_file.name,
                "size_mb": round(backup_file.stat().st_size / 1024 / 1024, 2),
                "created": datetime.fromtimestamp(backup_file.stat().st_mtime).isoformat()
            })
        
        return backups
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list backups: {str(e)}")
