import sys
import os
from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv

# Load env to get DB URL
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env, using default from config.py")
    DATABASE_URL = "postgresql://admin@127.0.0.1:5433/registry"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("\n--- PROJECTS ---")
    result = conn.execute(text("SELECT id, name FROM projects"))
    projects = result.fetchall()
    for p in projects:
        print(f"Project: {p.name} (ID: {p.id})")

    print("\n--- AREAS ---")
    result = conn.execute(text("SELECT code, name, project_id FROM areas"))
    areas = result.fetchall()
    for a in areas:
        print(f"Area: {a.name} (Code: {a.code}, Project ID: {a.project_id})")
