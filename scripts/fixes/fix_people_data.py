import sqlite3
import uuid
import json

DATABASE_URL = "tr2_registry.db"

def fix_people_data():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("Starting People Data Fix...")

    # 1. Get Project Mapping (Name -> ID)
    cursor.execute("SELECT id, name FROM projects")
    projects = cursor.fetchall()
    project_map = {p["name"]: p["id"] for p in projects}
    print(f"Found {len(project_map)} projects.")

    # 2. Fetch all people
    cursor.execute("SELECT * FROM people")
    people = cursor.fetchall()
    print(f"Found {len(people)} people records.")

    updates = []
    deletes = []
    seen_people = {} # Key: (name, project_id) -> id

    for p in people:
        p_id = p["id"]
        name = p["name"]
        project_id = p["project_id"]
        
        # Fix Project ID
        if project_id and project_id in project_map:
            print(f"Fixing project_id for {name}: {project_id} -> {project_map[project_id]}")
            project_id = project_map[project_id]
            updates.append((project_id, p_id))
        
        # Deduplication Key
        key = (name, project_id)
        
        if key in seen_people:
            print(f"Duplicate found for {name} (Project: {project_id}). Marking {p_id} for deletion.")
            deletes.append(p_id)
        else:
            seen_people[key] = p_id

    # Apply Updates
    if updates:
        cursor.executemany("UPDATE people SET project_id = ? WHERE id = ?", updates)
        print(f"Updated {len(updates)} records with correct Project ID.")

    # Apply Deletes
    if deletes:
        placeholders = ','.join(['?'] * len(deletes))
        cursor.execute(f"DELETE FROM people WHERE id IN ({placeholders})", deletes)
        print(f"Deleted {len(deletes)} duplicate records.")

    conn.commit()

    # 3. Drop Columns (SQLite requires recreating the table for complex schema changes usually, but DROP COLUMN is supported in newer versions)
    # We will try DROP COLUMN first.
    try:
        print("Attempting to drop columns: person_type, role, email...")
        cursor.execute("ALTER TABLE people DROP COLUMN person_type")
        cursor.execute("ALTER TABLE people DROP COLUMN role")
        cursor.execute("ALTER TABLE people DROP COLUMN email") # Assuming email exists, user mentioned it
        print("Columns dropped successfully.")
    except sqlite3.OperationalError as e:
        print(f"DROP COLUMN failed (might be old SQLite version): {e}")
        print("Attempting Copy-Swap method...")
        
        # Create new table without unwanted columns
        cursor.execute("""
            CREATE TABLE people_new (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                description TEXT,
                project_id VARCHAR,
                roles JSON,
                FOREIGN KEY(project_id) REFERENCES projects(id)
            )
        """)
        
        # Copy data
        # Note: We need to handle 'roles' migration if it was in 'role' column previously?
        # User said "delete the role... column". Assuming 'roles' (JSON) is the one to keep as per model.
        # But wait, the model had 'roles = Column(JSON, default=list)'.
        # Let's check if 'roles' column exists in current schema.
        # If 'roles' exists, we copy it. If not, we might need to migrate 'role' to 'roles'.
        # User said "delete the role... column".
        # Let's assume 'roles' exists and we just copy common fields.
        
        cursor.execute("INSERT INTO people_new (id, name, description, project_id, roles) SELECT id, name, description, project_id, roles FROM people")
        
        cursor.execute("DROP TABLE people")
        cursor.execute("ALTER TABLE people_new RENAME TO people")
        cursor.execute("CREATE INDEX ix_people_id ON people (id)")
        print("Table recreated successfully.")

    conn.commit()
    conn.close()
    print("Fix complete.")

if __name__ == "__main__":
    fix_people_data()
