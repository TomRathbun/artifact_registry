import sqlite3
import json
import uuid

DB_PATH = "registry.db"

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Starting migration...")
    
    # 1. Add new columns to people table
    try:
        cursor.execute("ALTER TABLE people ADD COLUMN project_id VARCHAR")
        cursor.execute("ALTER TABLE people ADD COLUMN roles JSON")
        cursor.execute("ALTER TABLE people ADD COLUMN description TEXT")
        print("Added columns to people table.")
    except sqlite3.OperationalError as e:
        print(f"Columns might already exist: {e}")

    # 2. Migrate existing People (Owners/Stakeholders)
    cursor.execute("SELECT id, person_type, role FROM people")
    people = cursor.fetchall()
    
    for pid, ptype, role in people:
        roles = []
        if ptype == "owner":
            roles.append("owner")
        elif ptype == "stakeholder":
            roles.append("stakeholder")
        elif ptype == "both":
            roles.append("owner")
            roles.append("stakeholder")
            
        # Update roles and description (using old role field as description/title if needed, or just ignore)
        # For now, let's just set the roles.
        cursor.execute("UPDATE people SET roles = ? WHERE id = ?", (json.dumps(roles), pid))
        
    print(f"Migrated {len(people)} existing people.")

    # 3. Migrate Actors to People
    # Check if actors table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='actors'")
    if not cursor.fetchone():
        print("Actors table not found, skipping actor migration.")
        conn.commit()
        conn.close()
        return

    cursor.execute("SELECT id, name, description, project_id FROM actors")
    actors = cursor.fetchall()
    
    migrated_actors = 0
    for aid, name, description, project_id in actors:
        # Create new person for each actor
        # We keep the same ID if possible to preserve relationships? 
        # No, Actor IDs and Person IDs might collide if we are unlucky (though UUIDs).
        # But wait, UseCases reference Actor IDs. If we change the ID, we break the link.
        # So we MUST preserve the ID if we want to keep the link without updating UseCases manually.
        # Let's try to insert with the same ID.
        
        roles = ["actor"]
        
        # Check if ID already exists in people (unlikely but possible)
        cursor.execute("SELECT id FROM people WHERE id = ?", (aid,))
        if cursor.fetchone():
            print(f"Warning: Actor ID {aid} already exists in people table. Skipping/Merging?")
            # If exists, just add 'actor' role?
            cursor.execute("SELECT roles FROM people WHERE id = ?", (aid,))
            current_roles_json = cursor.fetchone()[0]
            current_roles = json.loads(current_roles_json) if current_roles_json else []
            if "actor" not in current_roles:
                current_roles.append("actor")
                cursor.execute("UPDATE people SET roles = ?, project_id = ? WHERE id = ?", (json.dumps(current_roles), project_id, aid))
        else:
            cursor.execute(
                "INSERT INTO people (id, name, description, project_id, roles, email, person_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (aid, name, description, project_id, json.dumps(roles), "", "actor") # person_type is deprecated but might have non-null constraint
            )
            migrated_actors += 1
            
    print(f"Migrated {migrated_actors} actors to people.")
    
    # 4. Drop actors table? 
    # Maybe rename it to backup just in case
    cursor.execute("ALTER TABLE actors RENAME TO actors_backup")
    print("Renamed actors table to actors_backup.")
    
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
