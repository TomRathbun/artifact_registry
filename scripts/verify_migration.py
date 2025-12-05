import sys
import os
from sqlalchemy import create_engine, text

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.config import settings

def verify():
    print(f"Connecting to: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Check counts
        tables = ['projects', 'people', 'components', 'needs']
        for t in tables:
            try:
                count = conn.execute(text(f"SELECT count(*) FROM {t}")).scalar()
                print(f"Table '{t}': {count} rows")
                if count == 0 and t != 'projects': # Projects might be 1
                     print(f"Warning: '{t}' is empty!")
            except Exception as e:
                print(f"Error checking '{t}': {e}")

if __name__ == "__main__":
    verify()
