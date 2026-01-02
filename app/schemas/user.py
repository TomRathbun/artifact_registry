# app/schemas/user.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    username: str
    full_name: Optional[str] = None
    roles: Optional[List[str]] = ["viewer"]

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    roles: Optional[List[str]] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    password_expired: Optional[bool] = None

class UserOut(UserBase):
    aid: str
    is_active: bool
    password_expired: bool
    created_date: datetime

    model_config = ConfigDict(from_attributes=True)