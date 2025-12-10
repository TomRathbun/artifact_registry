from app.db.session import engine
from app.db.base import Base
from sqlalchemy import text

def migrate():
    with engine.connect() as connection:
        # Create diagram_edges table
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS diagram_edges (
                diagram_id VARCHAR NOT NULL,
                source_id VARCHAR NOT NULL,
                target_id VARCHAR NOT NULL,
                source_handle VARCHAR,
                target_handle VARCHAR,
                PRIMARY KEY (diagram_id, source_id, target_id),
                FOREIGN KEY(diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE,
                FOREIGN KEY(source_id) REFERENCES components(id) ON DELETE CASCADE,
                FOREIGN KEY(target_id) REFERENCES components(id) ON DELETE CASCADE
            )
        """))
        print("Created diagram_edges table")

if __name__ == "__main__":
    migrate()
