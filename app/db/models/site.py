from sqlalchemy import Column, String
from app.db.base import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    security_domain = Column(String, nullable=True)
