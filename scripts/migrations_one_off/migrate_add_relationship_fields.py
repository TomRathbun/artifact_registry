import sqlite3
import os

def migrate():
    db_path = os.path.join(os.getcwd(), 'tr2_registry.db')
    print(f"Connecting to database at {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE component_relationships ADD COLUMN type TEXT DEFAULT 'composition'")
        print("Added type column")
    except sqlite3.OperationalError as e:
        print(f"Error adding type: {e}")
        
    try:
        cursor.execute("ALTER TABLE component_relationships ADD COLUMN protocol TEXT")
        print("Added protocol column")
    except sqlite3.OperationalError as e:
        print(f"Error adding protocol: {e}")

    try:
        cursor.execute("ALTER TABLE component_relationships ADD COLUMN data_items TEXT")
        print("Added data_items column")
    except sqlite3.OperationalError as e:
        print(f"Error adding data_items: {e}")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
