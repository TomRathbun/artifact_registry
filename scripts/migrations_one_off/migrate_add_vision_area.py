"""
Manual database migration script for vision area.

This script adds the area column to the visions table.

Run this script to apply the migration:
    python migrate_add_vision_area.py
"""

from app.db.base import Base, engine
from sqlalchemy import text

def run_migration():
    """Add area column to visions table"""
    print("Starting database migration for vision area...")
    
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE visions ADD COLUMN area VARCHAR"))
            print("✅ Added area column to visions table")
        except Exception as e:
            print(f"⚠️  Could not add column (might already exist): {e}")

if __name__ == "__main__":
    run_migration()
