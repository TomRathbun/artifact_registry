from app.db.session import SessionLocal
from app.db.models.diagram import Diagram
from app.db.models.project import Project

db = SessionLocal()

# Find the project "TR2"
project = db.query(Project).filter(Project.name == "TR2").first()
if not project:
    print("Project TR2 not found!")
    exit(1)

print(f"Project TR2 found with ID: {project.id}")

# Find diagrams with project_id "TR2"
diagrams = db.query(Diagram).filter(Diagram.project_id == "TR2").all()
print(f"Found {len(diagrams)} diagrams with project_id='TR2'")

for d in diagrams:
    print(f"Updating diagram {d.name} ({d.id}) to project_id {project.id}")
    d.project_id = project.id

db.commit()
print("Update complete.")
db.close()
