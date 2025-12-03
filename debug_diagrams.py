from app.db.session import SessionLocal
from app.db.models.diagram import Diagram, DiagramEdge

db = SessionLocal()
diagrams = db.query(Diagram).all()

print(f"Total diagrams found: {len(diagrams)}")
for d in diagrams:
    edge_count = db.query(DiagramEdge).filter(DiagramEdge.diagram_id == d.id).count()
    print(f"ID: {d.id}, Name: {d.name}, Project ID: {d.project_id}, Edges: {edge_count}")

from app.db.models.project import Project
projects = db.query(Project).all()
print(f"\nTotal projects found: {len(projects)}")
for p in projects:
    print(f"ID: {p.id}, Name: {p.name}")

db.close()
