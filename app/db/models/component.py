from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base

class ComponentRelationship(Base):
    __tablename__ = 'component_relationships'
    
    parent_id = Column(String, ForeignKey('components.id'), primary_key=True)
    child_id = Column(String, ForeignKey('components.id'), primary_key=True)
    cardinality = Column(String, nullable=True) # e.g., "1", "1..*", "0..1"
    type = Column(String, default='composition') # composition, communication
    protocol = Column(String, nullable=True)
    data_items = Column(String, nullable=True)

class Component(Base):
    __tablename__ = "components"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # Hardware or Software
    description = Column(String, nullable=True)
    x = Column(Integer, nullable=True)
    y = Column(Integer, nullable=True)

    # Relationships
    # Children relationships (where this component is the parent)
    children_relationships = relationship(
        "ComponentRelationship",
        foreign_keys=[ComponentRelationship.parent_id],
        backref="parent",
        cascade="all, delete-orphan"
    )

    # Parent relationships (where this component is the child)
    parent_relationships = relationship(
        "ComponentRelationship",
        foreign_keys=[ComponentRelationship.child_id],
        backref="child",
        cascade="all, delete-orphan"
    )
