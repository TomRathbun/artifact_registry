from sqlalchemy import Column, String, Text, Enum as SQLEnum
from app.db.base import BaseArtifact
import enum

class DocumentType(str, enum.Enum):
    URL = "url"
    FILE = "file"
    TEXT = "text"

class Document(BaseArtifact):
    __tablename__ = "documents"

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False, default=DocumentType.URL)
    content_url = Column(String, nullable=True) # URL or File Path (optional for TEXT)
    content_text = Column(Text, nullable=True) # Markdown content for TEXT type
    mime_type = Column(String, nullable=True) # e.g., application/pdf
