import sqlite3

def migrate():
    conn = sqlite3.connect('tr2_registry.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE components ADD COLUMN description TEXT")
        print("Successfully added 'description' column to 'components' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("'description' column already exists in 'components' table.")
        else:
            print(f"Error adding column: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
