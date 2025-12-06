from fastapi import APIRouter
from app.api.v1.endpoints import users, linkage, need, use_case, vision, metadata, projects, site, component, diagram, artifact_event, system, document, database
from app.api.v1.endpoints import requirement   # <-- NEW


api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(linkage.router, prefix="/linkage", tags=["linkage"])
api_router.include_router(need.router, prefix="/need", tags=["need"])
api_router.include_router(requirement.router, prefix="/requirement", tags=["requirement"])
api_router.include_router(use_case.router, prefix="/use_case", tags=["use_case"])
api_router.include_router(vision.router, prefix="/vision", tags=["vision"])
api_router.include_router(metadata.router, prefix="/metadata", tags=["metadata"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(site.router, prefix="/sites", tags=["sites"])
api_router.include_router(component.router, prefix="/components", tags=["components"])
api_router.include_router(diagram.router, tags=["diagrams"])
api_router.include_router(artifact_event.router, prefix="/events", tags=["events"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(document.router, prefix="/documents", tags=["documents"])
api_router.include_router(database.router, prefix="/database", tags=["database"])

