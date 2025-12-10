import sqlite3
import os

def migrate():
    db_path = os.path.join(os.getcwd(), 'tr2_registry.db')
    print(f"Connecting to database at {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE components ADD COLUMN x INTEGER")
        print("Added x column")
    except sqlite3.OperationalError as e:
        print(f"Error adding x: {e}")
        
    try:
        cursor.execute("ALTER TABLE components ADD COLUMN y INTEGER")
        print("Added y column")
    except sqlite3.OperationalError as e:
        print(f"Error adding y: {e}")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
