"""
Database sync utility for artifact registry.
Exports/imports PostgreSQL database for syncing between locations.
"""
import subprocess
import sys
from datetime import datetime
from pathlib import Path
import argparse

# Database configuration
DB_HOST = "localhost"
DB_USER = "postgres"
DB_NAME = "artifact_registry"
BACKUP_DIR = Path(__file__).resolve().parents[2] / "db_backups"

def export_database(output_file: str = None):
    """Export database to a dump file."""
    BACKUP_DIR.mkdir(exist_ok=True)
    
    if not output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = BACKUP_DIR / f"artifact_registry_{timestamp}.dump"
    else:
        output_file = Path(output_file)
    
    print(f"Exporting database to {output_file}...")
    
    cmd = [
        "pg_dump",
        "-h", DB_HOST,
        "-U", DB_USER,
        "-d", DB_NAME,
        "-F", "c",  # Custom format (compressed)
        "-f", str(output_file)
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"✓ Export successful: {output_file}")
        print(f"  File size: {output_file.stat().st_size / 1024 / 1024:.2f} MB")
        return output_file
    except subprocess.CalledProcessError as e:
        print(f"✗ Export failed: {e}")
        sys.exit(1)

def import_database(input_file: str, clean: bool = True):
    """Import database from a dump file."""
    input_file = Path(input_file)
    
    if not input_file.exists():
        print(f"✗ File not found: {input_file}")
        sys.exit(1)
    
    print(f"Importing database from {input_file}...")
    if clean:
        print("  (This will drop existing tables)")
    
    cmd = [
        "pg_restore",
        "-h", DB_HOST,
        "-U", DB_USER,
        "-d", DB_NAME,
    ]
    
    if clean:
        cmd.append("-c")  # Clean (drop) database objects before recreating
    
    cmd.append(str(input_file))
    
    try:
        subprocess.run(cmd, check=True)
        print(f"✓ Import successful")
    except subprocess.CalledProcessError as e:
        print(f"✗ Import failed: {e}")
        print("\nNote: Some errors are normal if tables don't exist yet.")
        sys.exit(1)

def list_backups():
    """List available backup files."""
    if not BACKUP_DIR.exists():
        print("No backups directory found.")
        return
    
    backups = sorted(BACKUP_DIR.glob("*.dump"), reverse=True)
    
    if not backups:
        print("No backup files found.")
        return
    
    print("\nAvailable backups:")
    for i, backup in enumerate(backups, 1):
        size_mb = backup.stat().st_size / 1024 / 1024
        mtime = datetime.fromtimestamp(backup.stat().st_mtime)
        print(f"  {i}. {backup.name}")
        print(f"     Size: {size_mb:.2f} MB | Modified: {mtime.strftime('%Y-%m-%d %H:%M:%S')}")

def main():
    parser = argparse.ArgumentParser(description="Sync artifact registry database")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Export command
    export_parser = subparsers.add_parser("export", help="Export database to file")
    export_parser.add_argument("-o", "--output", help="Output file path")
    
    # Import command
    import_parser = subparsers.add_parser("import", help="Import database from file")
    import_parser.add_argument("file", help="Input file path")
    import_parser.add_argument("--no-clean", action="store_true", help="Don't drop existing tables")
    
    # List command
    subparsers.add_parser("list", help="List available backups")
    
    args = parser.parse_args()
    
    if args.command == "export":
        export_database(args.output)
    elif args.command == "import":
        import_database(args.file, clean=not args.no_clean)
    elif args.command == "list":
        list_backups()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
