import sys
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://admin@127.0.0.1:5433/registry"
    
# UPLOAD DIR from config logic (hardcoded fallback based on findings)
UPLOAD_DIR = Path("C:/Users/USER/registry-data/uploads")

TR2_ID = 'a1573933-ec35-4bbd-a94c-e0fedbd2581d'

engine = create_engine(DATABASE_URL)

print(f"Scanning for images in {UPLOAD_DIR}...")
if not UPLOAD_DIR.exists():
    print("Upload directory does not exist!")
    sys.exit(1)

with engine.connect() as conn:
    count = 0
    skipped = 0
    for item in UPLOAD_DIR.iterdir():
        if item.is_file():
            # Basic check for image extensions? Or just assume everything in uploads is relevant?
            # Images.py didn't seem to enforce extension strictness on list, but gallery expects images.
            if item.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']:
                # Check if exists
                res = conn.execute(text("SELECT id FROM images WHERE filename = :fname"), {"fname": item.name})
                if res.fetchone():
                    skipped += 1
                    continue
                
                # Insert
                print(f"Migrating: {item.name}")
                conn.execute(text("""
                    INSERT INTO images (id, filename, project_id, created_at)
                    VALUES (:id, :fname, :pid, NOW())
                """), {
                    "id": str(item.name), # Using filename as ID or UUID? Model says UUID default.
                    # Wait, model says id is UUID. We should generate a UUID.
                    # But if we want to be safe, let's use a real uuid.
                    # Actually, the model has `id = Column(String, primary_key=True, default=generate_uuid)`
                    # We should generate one.
                    "fname": item.name,
                    "pid": TR2_ID
                })
                # Re-do with uuid
                
    # Actually python needs uuid import
    pass

# Refine script with UUID generation
