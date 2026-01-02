from sqlalchemy import Column, String, JSON, Text, Enum as SQLEnum, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseArtifact
from app.enums import NeedLevel

# Association tables
need_sites = Table(
    'need_sites',
    Base.metadata,
    Column('need_id', String, ForeignKey('needs.aid', ondelete='CASCADE'), primary_key=True),
    Column('site_id', String, ForeignKey('sites.id', ondelete='CASCADE'), primary_key=True)
)

need_components = Table(
    'need_components',
    Base.metadata,
    Column('need_id', String, ForeignKey('needs.aid', ondelete='CASCADE'), primary_key=True),
    Column('component_id', String, ForeignKey('components.id', ondelete='CASCADE'), primary_key=True)
)

class Need(BaseArtifact):
    __tablename__ = "needs"

    # Core content
    title       = Column(String, nullable=False)   # e.g., "Secure User Authentication"
    description = Column(Text, nullable=False)     # Full need statement
    level       = Column(SQLEnum(NeedLevel), nullable=True) # Mission, Enterprise, Technical

    # Optional but HIGHLY valuable for workshops
    rationale   = Column(Text, nullable=True)      # Why this need exists (justification)
    area        = Column(String, nullable=True)    # Area/domain (e.g., "AI", "Zero-Trust")
    
    # Foreign Keys to People
    owner_id       = Column(String, nullable=True) # FK to people.id (enforced in app logic or real FK)
    stakeholder_id = Column(String, nullable=True) # FK to people.id

    # Relationships
    sites = relationship("Site", secondary=need_sites, backref="needs")
    components = relationship("Component", secondary=need_components, backref="needs")
