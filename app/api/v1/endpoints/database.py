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
from alembic.config import Config
from alembic import command
from app.core.config import settings

router = APIRouter()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5433")
DB_USER = os.getenv("DB_USER", "admin")
DB_NAME = os.getenv("DB_NAME", "registry")
BACKUP_DIR = settings.BACKUP_DIR

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
        filename = f"registry_backup_{timestamp}.sql"
        filepath = BACKUP_DIR / filename
        
        # Run pg_dump with plain SQL format
        cmd = [
            str(PG_DUMP),
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", str(filepath),
            "--clean",  # Include DROP commands
            "--if-exists",  # Don't error if objects don't exist
            "--no-owner",  # Don't include ownership commands
            "--no-privileges"  # Don't include privilege commands
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
            # Terminate all connections to the database
            terminate_cmd = [
                str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
                "-h", DB_HOST,
                "-p", DB_PORT,
                "-U", DB_USER,
                "-d", "postgres",
                "-c", f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{DB_NAME}' AND pid <> pg_backend_pid();"
            ]
            
            subprocess.run(
                terminate_cmd,
                capture_output=True,
                text=True,
                env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "")}
            )
            
            # Drop the database
            drop_cmd = [
                str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
                "-h", DB_HOST,
                "-p", DB_PORT,
                "-U", DB_USER,
                "-d", "postgres",
                "-c", f"DROP DATABASE IF EXISTS {DB_NAME};"
            ]
            
            drop_result = subprocess.run(
                drop_cmd,
                capture_output=True,
                text=True,
                env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "")}
            )
            
            if drop_result.returncode != 0:
                raise Exception(f"Failed to drop database: {drop_result.stderr}")
            
            # Create the database
            create_cmd = [
                str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
                "-h", DB_HOST,
                "-p", DB_PORT,
                "-U", DB_USER,
                "-d", "postgres",
                "-c", f"CREATE DATABASE {DB_NAME};"
            ]
            
            create_result = subprocess.run(
                create_cmd,
                capture_output=True,
                text=True,
                env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "")}
            )
            
            if create_result.returncode != 0:
                raise Exception(f"Failed to create database: {create_result.stderr}")
            
            # Restore using psql (for SQL format backups)
            cmd = [
                str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
                "-h", DB_HOST,
                "-p", DB_PORT,
                "-U", DB_USER,
                "-d", DB_NAME,
                "-f", tmp_path,
                "-q"  # Quiet mode
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "")}
            )
            
            # Check for errors (psql returns non-zero on errors)
            if result.returncode != 0 and "ERROR" in result.stderr:
                raise Exception(f"Restore failed: {result.stderr}")
            
            # Run database migrations to ensure schema is up to date
            try:
                # Assuming alembic.ini is in the root directory
                alembic_cfg = Config("alembic.ini")
                command.upgrade(alembic_cfg, "head")
            except Exception as e:
                return {
                    "message": "Database restored successfully, but schema migration failed.",
                    "warnings": f"Migration error: {str(e)}. Please check logs."
                }
            
            return {"message": "Database restored and migrations applied successfully", "warnings": result.stderr if result.stderr else None}
            
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
        for backup_file in sorted(BACKUP_DIR.glob("*.sql"), reverse=True):
            backups.append({
                "filename": backup_file.name,
                "size_mb": round(backup_file.stat().st_size / 1024 / 1024, 2),
                "created": datetime.fromtimestamp(backup_file.stat().st_mtime).isoformat()
            })
        
        return backups
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list backups: {str(e)}")
