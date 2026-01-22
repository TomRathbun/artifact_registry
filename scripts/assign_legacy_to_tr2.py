import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://admin@127.0.0.1:5433/registry"
    
engine = create_engine(DATABASE_URL)

TR2_ID = 'a1573933-ec35-4bbd-a94c-e0fedbd2581d'

print(f"Assigning legacy artifacts to TR2 Project ID: {TR2_ID}")

tables_to_update = ['areas', 'sites', 'components', 'people', 'images']

with engine.connect() as conn:
    for table in tables_to_update:
        # We also want to exclude the explicit 'GLOBAL' area code from being assigned to TR2
        # if the table is 'areas'.
        if table == 'areas':
            sql = text(f"UPDATE {table} SET project_id = :pid WHERE project_id IS NULL AND code != 'GLOBAL'")
        else:
            sql = text(f"UPDATE {table} SET project_id = :pid WHERE project_id IS NULL")
            
        result = conn.execute(sql, {"pid": TR2_ID})
        print(f"Updated {result.rowcount} rows in '{table}'")
        
    conn.commit()
    print("Legacy assignment complete.")
