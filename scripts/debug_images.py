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

print(f"Checking Images for TR2: {TR2_ID}")

with engine.connect() as conn:
    sql = text("SELECT count(*) FROM images WHERE project_id = :pid")
    count = conn.execute(sql, {"pid": TR2_ID}).scalar()
    print(f"Found {count} images for TR2.")
    
    # List filenames
    sql = text("SELECT filename FROM images WHERE project_id = :pid")
    rows = conn.execute(sql, {"pid": TR2_ID}).fetchall()
    for r in rows:
        print(f"- {r.filename}")
