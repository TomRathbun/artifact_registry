"""
Compatibility entrypoint. Prefer:

    uvicorn artifact_registry:app

This module re-exports the same application object so `app.main:app` also works.
"""
from artifact_registry import app

__all__ = ["app"]
