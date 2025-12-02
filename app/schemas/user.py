# app/schemas/user.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    aid: int
    email: str
    is_active: bool = True
    created_date: datetime

    model_config = ConfigDict(from_attributes=True)  # Replaces class Config