import sys
import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback or error
    print("DATABASE_URL not found in .env, using default from config.py")
    DATABASE_URL = "postgresql://admin@127.0.0.1:5433/registry"

try:
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    print("\n--- SCHEMA CHECK ---")
    
    # Check Components
    if inspector.has_table('components'):
        cols = [c['name'] for c in inspector.get_columns('components')]
        print(f"Components Table Columns: {cols}")
        if 'project_id' in cols:
            print("VERIFIED: project_id exists in components.")
        else:
            print("MISSING: project_id MISSING in components.")
    else:
        print("Components table NOT FOUND.")

    # Check Images
    if inspector.has_table('images'):
        print("Images table FOUND.")
    else:
        print("Images table NOT FOUND (Dropped?).")

except Exception as e:
    print(f"Error: {e}")
