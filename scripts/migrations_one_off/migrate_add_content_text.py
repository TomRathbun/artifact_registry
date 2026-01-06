
import os
import sys
from sqlalchemy import create_engine, text

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database configuration
# Assuming app.core.config or similar exists, but for safety in this script we can try to connect directly
# or use the pattern from other scripts if checked.
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/registry")
DATABASE_URL = "postgresql://admin@localhost:5433/registry"

def migrate():
    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking if 'content_text' column exists in 'documents' table...")
        # Check if column exists
        # This execute starts a transaction
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='documents' AND column_name='content_text'"))
        exists = result.fetchone()
        
        # Commit the read transaction
        conn.commit()

        if exists:
            print("Column 'content_text' already exists.")
        else:
            print("Adding 'content_text' column to 'documents' table...")
            # For DDL, we often want autocommit or a fresh transaction
            # conn.begin() works if no transaction is active
            with conn.begin():
                conn.execute(text("ALTER TABLE documents ADD COLUMN content_text TEXT"))
            print("Column added successfully.")

if __name__ == "__main__":
    try:
        migrate()
        print("Migration completed.")
    except Exception as e:
        print(f"Migration failed: {e}")
