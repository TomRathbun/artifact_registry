"""
Migration: Add tags, lifecycle, and project_id to components table
"""
import sqlite3

def migrate():
    conn = sqlite3.connect('registry.db')
    cursor = conn.cursor()
    
    try:
        # Add tags column (JSON array stored as string)
        cursor.execute('''
            ALTER TABLE components ADD COLUMN tags TEXT
        ''')
        print("✓ Added tags column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("- tags column already exists")
        else:
            raise
    
    try:
        # Add lifecycle column
        cursor.execute('''
            ALTER TABLE components ADD COLUMN lifecycle TEXT DEFAULT 'Active'
        ''')
        print("✓ Added lifecycle column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("- lifecycle column already exists")
        else:
            raise
    
    try:
        # Add project_id column (foreign key to projects)
        cursor.execute('''
            ALTER TABLE components ADD COLUMN project_id TEXT
        ''')
        print("✓ Added project_id column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("- project_id column already exists")
        else:
            raise
    
    # Set default values for existing rows
    cursor.execute('''
        UPDATE components 
        SET tags = '[]' 
        WHERE tags IS NULL
    ''')
    
    cursor.execute('''
        UPDATE components 
        SET lifecycle = 'Active' 
        WHERE lifecycle IS NULL
    ''')
    
    conn.commit()
    conn.close()
    print("\n✅ Migration completed successfully!")

if __name__ == '__main__':
    migrate()
