"""Safe path helpers for upload/backup file operations."""
from pathlib import Path

from fastapi import HTTPException


def sanitize_filename(name: str | None) -> str:
    """Return a basename-only filename; reject empty or traversal-like names."""
    if not name or not str(name).strip():
        raise HTTPException(status_code=400, detail="Filename is required")
    # Reject null bytes and path separators before basename
    raw = str(name).replace("\x00", "")
    cleaned = Path(raw).name
    if not cleaned or cleaned in (".", "..") or "/" in cleaned or "\\" in cleaned:
        raise HTTPException(status_code=400, detail="Invalid filename")
    return cleaned


def safe_join(base_dir: Path, *parts: str) -> Path:
    """
    Join path parts under base_dir and ensure the result stays inside base_dir.
    Raises HTTP 400 if the resolved path escapes the base directory.
    """
    base = Path(base_dir).resolve()
    candidate = base.joinpath(*parts).resolve()
    try:
        candidate.relative_to(base)
    except ValueError:
        raise HTTPException(status_code=400, detail="Path escapes allowed directory")
    return candidate
