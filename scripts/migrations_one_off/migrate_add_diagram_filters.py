"""
Manual database migration script for diagram filters.

This script adds the filter_data column to the diagrams table.

Run this script to apply the migration:
    python migrate_add_diagram_filters.py
"""

from app.db.base import Base, engine
# Import the model so it's registered with Base.metadata
from app.db.models.diagram import Diagram
from sqlalchemy import text

def run_migration():
    """Add filter_data column to diagrams table"""
    print("Starting database migration for diagram filters...")
    
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE diagrams ADD COLUMN filter_data JSON"))
            print("✅ Added filter_data column to diagrams table")
        except Exception as e:
            print(f"⚠️  Could not add column (might already exist): {e}")

if __name__ == "__main__":
    run_migration()
