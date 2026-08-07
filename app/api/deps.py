from typing import Generator, List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.roles import ROLE_PERMISSIONS, Role
from app.db.models.user import User
from app.db.session import get_db  # single canonical session dependency

# Re-export so callers can use deps.get_db or session.get_db interchangeably
# (same object — test overrides apply to both)
__all__ = [
    "get_db",
    "get_current_user",
    "get_current_active_user",
    "check_permissions",
    "oauth2_scheme",
    "User",
]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    if not getattr(user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Alias that always re-checks active status (already enforced in get_current_user)."""
    return current_user


def check_permissions(required_permissions: List[str]):
    """
    Dependency factory for checking granular permissions.
    Admins (role 'admin' or permission '*') always pass.
    """

    async def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> bool:
        user_roles = getattr(current_user, "roles", None) or []
        if not user_roles and getattr(current_user, "role", None):
            user_roles = [current_user.role]

        if Role.ADMIN.value in user_roles:
            return True

        all_permissions: set[str] = set()
        for r in user_roles:
            all_permissions.update(ROLE_PERMISSIONS.get(r, []))

        if "*" in all_permissions:
            return True

        for perm in required_permissions:
            if perm in all_permissions:
                return True

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not enough permissions. Required: {required_permissions}",
        )

    return permission_checker
