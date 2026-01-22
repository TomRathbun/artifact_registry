from app.db.session import SessionLocal
from sqlalchemy import text

def cleanup_orphans():
    session = SessionLocal()
    try:
        # Check for people with invalid project_id
        result = session.execute(text("SELECT id, name, project_id FROM people WHERE project_id NOT IN (SELECT id FROM projects)"))
        orphans = result.fetchall()
        print(f"Found {len(orphans)} orphan people records.")
        
        if orphans:
            # Set project_id to NULL for these records
            session.execute(text("UPDATE people SET project_id = NULL WHERE project_id NOT IN (SELECT id FROM projects)"))
            session.commit()
            print(f"Updated {len(orphans)} records to have project_id = NULL.")
        
        # Also check for Areas and Sites just in case, though I just added the column so they should be null anyway?
        # Actually, I added the column in the model but the migration is adding it to the DB.
        # Wait, if I'm running this script BEFORE migration, the 'areas' and 'sites' usage of project_id column might fail if it doesn't exist yet?
        # Yes. The migration ADDS the column. But 'people' already had it.
        # So I only need to clean 'people'.
        
    except Exception as e:
        print(f"Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    cleanup_orphans()
