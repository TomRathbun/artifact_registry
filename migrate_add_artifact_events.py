"""
Manual database migration script for artifact events.

This script adds the new artifact_events table.

Run this script to apply the migration:
    python migrate_add_artifact_events.py
"""

from app.db.base import Base, engine
# Import the model so it's registered with Base.metadata
from app.db.models.artifact_event import ArtifactEvent

def run_migration():
    """Create artifact_events table"""
    print("Starting database migration for artifact events...")
    
    # This will create all tables that don't exist yet
    Base.metadata.create_all(bind=engine)
    
    print("✅ Migration complete!")
    print("\nNew tables created:")
    print("  - artifact_events")

if __name__ == "__main__":
    run_migration()
