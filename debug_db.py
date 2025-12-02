from app.db.session import SessionLocal
from app.db.models.vision import Vision
from app.db.models.project import Project

db = SessionLocal()
visions = db.query(Vision).all()
projects = db.query(Project).all()

print("Projects:")
for p in projects:
    print(f"ID: {p.id}, Name: {p.name}")

print("\nVisions:")
for v in visions:
    print(f"AID: {v.aid}, Title: {v.title}, ProjectID: {v.project_id}")

db.close()
