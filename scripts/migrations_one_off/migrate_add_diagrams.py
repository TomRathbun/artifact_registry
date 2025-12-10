import sqlite3
import os

def migrate():
    db_path = os.path.join(os.getcwd(), 'tr2_registry.db')
    print(f"Migrating database at {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create diagrams table
        print("Creating diagrams table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS diagrams (
            id VARCHAR PRIMARY KEY,
            project_id VARCHAR NOT NULL,
            name VARCHAR NOT NULL,
            description TEXT,
            type VARCHAR DEFAULT 'component',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
        """)
        
        # Create diagram_components table
        print("Creating diagram_components table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS diagram_components (
            diagram_id VARCHAR NOT NULL,
            component_id VARCHAR NOT NULL,
            x INTEGER DEFAULT 0,
            y INTEGER DEFAULT 0,
            PRIMARY KEY (diagram_id, component_id),
            FOREIGN KEY (diagram_id) REFERENCES diagrams (id),
            FOREIGN KEY (component_id) REFERENCES components (id)
        )
        """)
        
        conn.commit()
        print("Migration successful!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
