from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings
from app.core.roles import ROLE_PERMISSIONS, Role
from app.db.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def check_permissions(required_permissions: List[str]):
    """
    Dependency factor for checking granular permissions.
    """
    async def permission_checker(current_user: User = Depends(get_current_user)):
        user_roles = getattr(current_user, "roles", [])
        if not user_roles and getattr(current_user, "role", None):
             user_roles = [current_user.role]
        
        if Role.ADMIN.value in user_roles:
            return True
            
        all_permissions = set()
        for r in user_roles:
            all_permissions.update(ROLE_PERMISSIONS.get(r, []))
            
        if "*" in all_permissions:
            return True
            
        for perm in required_permissions:
            if perm in all_permissions:
                return True
                
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not enough permissions. Required: {required_permissions}"
        )
    return permission_checker
