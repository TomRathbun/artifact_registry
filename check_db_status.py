import sqlite3
import os

def check_db():
    db_path = os.path.join(os.getcwd(), 'tr2_registry.db')
    print(f"Connecting to database at {db_path}")
    try:
        conn = sqlite3.connect(db_path, timeout=5)
        cursor = conn.cursor()
        
        print("Checking components table...")
        cursor.execute("PRAGMA table_info(components)")
        columns = [info[1] for info in cursor.fetchall()]
        print(f"Components columns: {columns}")
        
        print("Checking component_relationships table...")
        cursor.execute("PRAGMA table_info(component_relationships)")
        columns = [info[1] for info in cursor.fetchall()]
        print(f"Relationships columns: {columns}")
        
        print("Querying components...")
        cursor.execute("SELECT * FROM components LIMIT 5")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} components")
        
        conn.close()
        print("Database check passed")
    except Exception as e:
        print(f"Database check failed: {e}")

if __name__ == "__main__":
    check_db()
