"""
Fix document URLs to use the new API endpoint format.
Run this once to update existing documents.
"""
from app.db.session import SessionLocal
from app.db.models.document import Document
from pathlib import Path

def fix_document_urls():
    db = SessionLocal()
    try:
        documents = db.query(Document).filter(Document.document_type == 'file').all()
        
        for doc in documents:
            if doc.content_url and doc.content_url.startswith('uploads/'):
                # Extract just the filename
                filename = Path(doc.content_url).name
                # Update to new URL format
                doc.content_url = f"/api/v1/documents/files/{filename}"
                print(f"Updated {doc.aid}: {doc.content_url}")
        
        db.commit()
        print(f"\nFixed {len(documents)} documents")
        
    finally:
        db.close()

if __name__ == "__main__":
    fix_document_urls()
