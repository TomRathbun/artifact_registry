from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.models.document import DocumentType

# Shared properties
class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    document_type: DocumentType = DocumentType.URL
    content_url: Optional[str] = None
    content_text: Optional[str] = None
    mime_type: Optional[str] = None
    area: Optional[str] = None
    project_id: str

# Properties to receive via API on creation
class DocumentCreate(DocumentBase):
    pass

# Properties to receive via API on update
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_url: Optional[str] = None
    content_text: Optional[str] = None
    mime_type: Optional[str] = None
    document_type: Optional[DocumentType] = None
    status: Optional[str] = None

# Properties to return to client
class Document(DocumentBase):
    aid: str
    created_date: datetime
    last_updated: datetime
    status: str

    class Config:
        from_attributes = True
