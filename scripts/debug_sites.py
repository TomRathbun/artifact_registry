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

print(f"Checking Sites for TR2: {TR2_ID}")

with engine.connect() as conn:
    # Check Project existence
    res = conn.execute(text("SELECT id, name FROM projects WHERE id = :pid"), {"pid": TR2_ID})
    proj = res.fetchone()
    if proj:
        print(f"Project Found: {proj.name}")
    else:
        print("Project TR2 NOT FOUND! IDs might differ?")

    # Check Sites
    sql = text("SELECT id, name, project_id FROM sites WHERE project_id = :pid")
    result = conn.execute(sql, {"pid": TR2_ID})
    rows = result.fetchall()
    print(f"Found {len(rows)} sites for TR2:")
    for row in rows:
        print(row)

    # Check for ANY sites
    print("\nTotal Sites in DB:")
    all_sites = conn.execute(text("SELECT count(*) FROM sites")).scalar()
    print(all_sites)
    
    # Check for NULL project_id sites
    null_sites = conn.execute(text("SELECT count(*) FROM sites WHERE project_id IS NULL")).scalar()
    print(f"Sites with NULL project_id: {null_sites}")
