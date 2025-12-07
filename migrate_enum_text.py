
import os
import sys
from sqlalchemy import create_engine, text

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database configuration
# Using admin user as discovered previously
DATABASE_URL = "postgresql://admin@localhost:5432/registry"

def migrate():
    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking existing enum values for 'documenttype'...")
        # Start transaction for inspection
        with conn.begin(): 
             # Check current enum values - this query works on Postgres
             result = conn.execute(text("SELECT enum_range(NULL::documenttype)"))
             current_values = result.fetchone()[0]
             print(f"Current enum values: {current_values}")

        if 'TEXT' in str(current_values):
            print("'TEXT' already exists in 'documenttype' enum.")
        else:
            print("Adding 'TEXT' value to 'documenttype' enum...")
            # ALTER TYPE ... ADD VALUE cannot be run inside a transaction block in some PG versions/configurations
            # But SQLAlchemy's autocommit handling can be tricky.
            # Ideally we want to run this outside of a transaction block or in isolation.
            connection = engine.raw_connection()
            try:
                cursor = connection.cursor()
                cursor.execute("ALTER TYPE documenttype ADD VALUE 'TEXT'")
                connection.commit()
                print("Enum value added successfully.")
            finally:
                connection.close()

if __name__ == "__main__":
    try:
        migrate()
        print("Migration completed.")
    except Exception as e:
        print(f"Migration failed: {e}")
