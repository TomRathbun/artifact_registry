import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def verify_fix():
    print(f"Connecting to: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Inserting comment without ID...")
        # Insert without ID
        result = conn.execute(text("""
            INSERT INTO comments (artifact_aid, field_name, comment_text, author, resolved)
            VALUES ('TEST-123', 'test_field', 'Auto-ID Test', 'Tester', false)
            RETURNING id
        """))
        
        new_id = result.scalar()
        print(f"Success! Generated ID: {new_id}")
        
        if not new_id:
            print("Error: No ID returned!")
            sys.exit(1)
            
        print("Cleaning up...")
        conn.execute(text("DELETE FROM comments WHERE id = :id"), {"id": new_id})
        conn.commit()
        print("Verification complete.")

if __name__ == "__main__":
    verify_fix()
