import sys
import os
from sqlalchemy import create_engine, MetaData, inspect, text
from sqlalchemy.orm import sessionmaker

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.base import Base
# Import all models to ensure they are registered with Base
from app.api.v1.endpoints import need, use_case, requirement, vision, linkage, diagram, component, metadata as meta_models, site

# SQLite (Source)
SQLITE_URL = "sqlite:///./registry.db"
# Postgres (Destination) - adjust if you changed setup credentials
PG_URL = "postgresql://admin@localhost:5432/registry"

def migrate():
    print("--- Starting Migration ---")
    
    # 1. Connect to Source
    print(f"Connecting to Source: {SQLITE_URL}")
    sqlite_engine = create_engine(SQLITE_URL)
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SqliteSession()

    # 2. Connect to Destination
    print(f"Connecting to Destination: {PG_URL}")
    pg_engine = create_engine(PG_URL)
    PgSession = sessionmaker(bind=pg_engine)
    pg_session = PgSession()

    # 3. Create Tables in Destination
    print("Creating tables in PostgreSQL...")
    # Drop all first to ensure clean slate? Maybe safest.
    Base.metadata.drop_all(pg_engine)
    Base.metadata.create_all(pg_engine)

    # 4. Migrate Data
    # Use single transaction to allow disabling FKs
    with pg_engine.begin() as pg_conn:
        print("Disabling FK checks for migration...")
        pg_conn.execute(text("SET session_replication_role = 'replica';"))
        
        tables = Base.metadata.sorted_tables
        print("Migration Order:", [t.name for t in tables])
        
        for table in tables:
            table_name = table.name
            print(f"Migrating table: {table_name}...")
            
            # Read from SQLite
            columns = [c.name for c in table.columns]
            data = []
            with sqlite_engine.connect() as sqlite_conn:
                data = sqlite_conn.execute(table.select()).fetchall()
            
            if not data:
                print(f"  No data in {table_name}. Skipping.")
                continue
                
            print(f"  Copying {len(data)} rows...")
            
            # Insert into Postgres
            chunk_size = 1000
            for i in range(0, len(data), chunk_size):
                chunk = data[i:i+chunk_size]
                chunk_dicts = [dict(row._mapping) for row in chunk]
                pg_conn.execute(table.insert(), chunk_dicts)
                
            # Reset Sequence
            if 'id' in columns:
                try:
                    # Only for serial int/bigint PKs. UUIDs won't use sequences and max(id) on string might be weird but harmless usually.
                    # Verify column type:
                    pk_col = table.primary_key.columns[0]
                    if str(pk_col.type).lower().startswith(('int', 'bigint', 'serial')):
                         print(f"  Resetting sequence for {table_name}...")
                         seq_sql = text(f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), coalesce(max(id), 1)) FROM {table_name};")
                         pg_conn.execute(seq_sql)
                except Exception as e:
                    # Ignore sequence errors for UUIDs etc
                    pass

    print("--- Migration Complete ---")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Migration Failed: {e}")
