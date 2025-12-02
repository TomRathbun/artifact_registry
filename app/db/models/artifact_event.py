from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base

class ArtifactEvent(Base):
    __tablename__ = "artifact_events"

    id            = Column(Integer, primary_key=True, index=True)
    artifact_type = Column(String, nullable=False)   # "StakeholderNeed", "UseCase", etc.
    artifact_id   = Column(String, nullable=False)   # FK to the artifact row (using String for AID/UUID)
    event_type    = Column(String, nullable=False)   # "StatusChanged", "Created", "Commented", etc.
    event_data    = Column(JSON, nullable=False)     # { "from": "Draft", "to": "Ready_for_Review", "rationale": "..."}
    timestamp     = Column(DateTime, default=datetime.utcnow)
    user_id       = Column(String, nullable=True)    # LDAP / username
    user_name     = Column(String, nullable=True)
    comment       = Column(String, nullable=True)
