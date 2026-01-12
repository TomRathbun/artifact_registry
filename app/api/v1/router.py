from fastapi import APIRouter
from app.api.v1.endpoints import users, linkage, need, use_case, vision, metadata, projects, site, component, diagram, artifact_event, system, document, database, comment, requirement, images, translation, utility, reports, classifier


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
api_router.include_router(comment.router, prefix="/comments", tags=["comments"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(translation.router, prefix="/translation", tags=["translation"])
api_router.include_router(utility.router, prefix="/utility", tags=["utility"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(classifier.router, prefix="/classifier", tags=["classifier"])

