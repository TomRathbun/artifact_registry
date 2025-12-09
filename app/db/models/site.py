from sqlalchemy import Column, String
from app.db.base import Base
import json

class Site(Base):
    __tablename__ = "sites"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    security_domain = Column(String, nullable=True)
    tags = Column(String, nullable=True) # JSON array of strings


