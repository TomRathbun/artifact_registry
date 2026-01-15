# scripts/initialize_database.py
# Initializes the database schema and stamps it with Alembic.
# This ensures fresh installations have the correct table structure.

import os
import sys
from sqlalchemy import create_engine
from alembic.config import Config
from alembic import command

# Add the project root to sys.path to allow importing app.*
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.db.base import Base, engine, SessionLocal
from app.db.models.user import User
from app.core.roles import Role

# Seed admin user hash (seclpass)
SECL_PASS_HASH = "$argon2id$v=19$m=65536,t=3,p=4$FSh3SKDmtXDxHTXC93snCA$5LaMcoAwxs4G5YFdT+/qbkI1sZaKLAzTLEr0iF4SWYM"

def initialize():
    print("--- Database Initialization ---")
    
    # 1. Create all tables defined in models
    print("Creating tables via SQLAlchemy...")
    Base.metadata.create_all(bind=engine)
    print("  [OK] Tables created.")

    # 2. Stamp the database with the latest Alembic revision
    print("Stamping database head with Alembic...")
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    command.stamp(alembic_cfg, "head")
    print("  [OK] Database stamped at HEAD.")

    # 3. Seed initial admin user if not present
    print("Seeding initial admin user...")
    with SessionLocal() as db:
        if not db.query(User).filter(User.username == "admin").first():
            admin_user = User(
                aid="admin",
                username="admin",
                email="admin@example.com",
                full_name="Administrator",
                roles=[Role.ADMIN.value],
                password_expired=True,
                hashed_password=SECL_PASS_HASH
            )
            db.add(admin_user)
            db.commit()
            print("  [OK] Admin user created.")
        else:
            print("  Admin user already exists.")

    print("\nDatabase initialization complete.")

if __name__ == "__main__":
    try:
        initialize()
    except Exception as e:
        print(f"\nERROR: Initialization failed: {e}")
        sys.exit(1)
