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

print(f"Testing query for Project ID: {TR2_ID}")

sql = text("""
    SELECT * FROM areas 
    WHERE project_id = :pid OR code = 'GLOBAL'
""")

with engine.connect() as conn:
    result = conn.execute(sql, {"pid": TR2_ID})
    rows = result.fetchall()
    print(f"Found {len(rows)} areas:")
    for row in rows:
        print(row)
