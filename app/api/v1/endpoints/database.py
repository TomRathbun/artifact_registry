"""
Database backup and restore endpoints.
Provides full PostgreSQL database export/import functionality.
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import FileResponse, StreamingResponse
import subprocess
import os
from pathlib import Path
from datetime import datetime
import tempfile
from alembic.config import Config
from alembic import command
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.base import Base, engine
from sqlalchemy import inspect, text
import json
from app.api import deps

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
METADATA_FILE = BACKUP_DIR / "backups_metadata.json"

def get_metadata():
    if not METADATA_FILE.exists():
        return {}
    with open(METADATA_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return {}

def save_metadata(metadata):
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

@router.get("/backup")
async def backup_database(_perm=Depends(deps.check_permissions(["db:backup"]))):
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

@router.post("/backup/create")
async def create_backup(note: str = "", _perm=Depends(deps.check_permissions(["db:backup"]))):
    """
    Create a new backup file on the server.
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"registry_backup_{timestamp}.sql"
        filepath = BACKUP_DIR / filename
        
        cmd = [
            str(PG_DUMP),
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", str(filepath),
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges"
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "postgres")}
        )
        
        if result.returncode != 0:
            raise Exception(f"pg_dump failed: {result.stderr}")
        
        if note:
            metadata = get_metadata()
            metadata[filename] = {"note": note, "created_at": datetime.now().isoformat()}
            save_metadata(metadata)
            
        return {"message": "Backup created successfully", "filename": filename}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup creation failed: {str(e)}")

@router.post("/restore")
async def restore_database(request: Request, _perm=Depends(deps.check_permissions(["db:restore"]))):
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
async def list_backups(_perm=Depends(deps.check_permissions(["db:status"]))):
    """
    List available backup files with metadata.
    """
    try:
        backups = []
        metadata = get_metadata()
        for backup_file in sorted(BACKUP_DIR.glob("*.sql"), reverse=True):
            file_meta = metadata.get(backup_file.name, {})
            backups.append({
                "filename": backup_file.name,
                "size_mb": round(backup_file.stat().st_size / 1024 / 1024, 2),
                "created": datetime.fromtimestamp(backup_file.stat().st_mtime).isoformat(),
                "note": file_meta.get("note", "")
            })
        
        return backups
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list backups: {str(e)}")

@router.get("/backups/{filename}")
async def download_backup(filename: str, _perm=Depends(deps.check_permissions(["db:backup"]))):
    """
    Download a specific backup file.
    """
    try:
        filepath = BACKUP_DIR / filename
        if not filepath.exists():
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download backup: {str(e)}")

@router.delete("/backups/{filename}")
async def delete_backup(filename: str, _perm=Depends(deps.check_permissions(["db:backup"]))):
    """
    Delete a backup file.
    """
    try:
        filepath = BACKUP_DIR / filename
        if not filepath.exists():
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        os.remove(filepath)
        
        metadata = get_metadata()
        if filename in metadata:
            del metadata[filename]
            save_metadata(metadata)
            
        return {"message": f"Backup {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete backup: {str(e)}")

@router.post("/backups/{filename}/note")
async def add_backup_note(filename: str, note_data: dict, _perm=Depends(deps.check_permissions(["db:backup"]))):
    """
    Add or update a note for a backup.
    """
    try:
        note = note_data.get("note", "")
        metadata = get_metadata()
        if filename not in metadata:
            metadata[filename] = {}
        metadata[filename]["note"] = note
        save_metadata(metadata)
        return {"message": "Note updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update note: {str(e)}")

@router.post("/backups/{filename}/restore")
async def restore_from_backup(filename: str, _perm=Depends(deps.check_permissions(["db:restore"]))):
    """
    Restore database from a specific backup file on the server.
    """
    try:
        filepath = BACKUP_DIR / filename
        if not filepath.exists():
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        # We can reuse the logic from restore_database but reading from filepath
        # Refactor restore logic into a helper if needed, but for now I'll just adapt it
        
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
            env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "postgres")}
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
        
        subprocess.run(
            drop_cmd,
            capture_output=True,
            text=True,
            env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "postgres")}
        )
        
        # Create the database
        create_cmd = [
            str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-d", "postgres",
            "-c", f"CREATE DATABASE {DB_NAME};"
        ]
        
        subprocess.run(
            create_cmd,
            capture_output=True,
            text=True,
            env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "postgres")}
        )
        
        # Restore using psql
        cmd = [
            str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", str(filepath),
            "-q"
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "postgres")}
        )
        
        if result.returncode != 0 and "ERROR" in result.stderr:
            raise Exception(f"Restore failed: {result.stderr}")
            
        # Run migrations
        try:
            alembic_cfg = Config("alembic.ini")
            command.upgrade(alembic_cfg, "head")
        except:
            pass
            
        return {"message": "Database restored successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@router.post("/restart")
async def restart_db(_perm=Depends(deps.check_permissions(["db:restore"]))):
    """
    Flushes all database connections.
    """
    try:
        terminate_cmd = [
            str(PG_BIN_DIR / ("psql.exe" if os.name == 'nt' else "psql")),
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-d", "postgres",
            "-c", f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{DB_NAME}' AND pid <> pg_backend_pid();"
        ]
        
        result = subprocess.run(
            terminate_cmd,
            capture_output=True,
            text=True,
            env={**os.environ, "PGPASSWORD": os.getenv("DB_PASSWORD", "postgres")}
        )
        
        return {"message": "Database connections flushed successfully", "details": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flush failed: {str(e)}")

@router.get("/schema")
async def get_schema(_perm=Depends(deps.check_permissions(["db:status"]))):
    """
    Get database tables and sample data.
    """
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        schema_info = []
        with SessionLocal() as db:
            for table_name in table_names:
                columns = inspector.get_columns(table_name)
                # Get first 5 rows
                try:
                    result = db.execute(text(f"SELECT * FROM {table_name} LIMIT 5"))
                    rows = [dict(row._mapping) for row in result]
                except:
                    rows = []
                
                schema_info.append({
                    "table": table_name,
                    "columns": [{"name": c["name"], "type": str(c["type"])} for c in columns],
                    "sample_data": rows
                })
                
        return schema_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get schema: {str(e)}")
