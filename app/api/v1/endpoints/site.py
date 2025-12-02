from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.models.site import Site
from app.schemas.site import SiteCreate, SiteUpdate, SiteOut

router = APIRouter()

@router.post("/", response_model=SiteOut)
def create_site(site_in: SiteCreate, db: Session = Depends(get_db)):
    site = Site(
        id=str(uuid4()),
        name=site_in.name,
        security_domain=site_in.security_domain
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site

@router.get("/", response_model=List[SiteOut])
def read_sites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sites = db.query(Site).offset(skip).limit(limit).all()
    return sites

@router.get("/{site_id}", response_model=SiteOut)
def read_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.put("/{site_id}", response_model=SiteOut)
def update_site(site_id: str, site_in: SiteUpdate, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    if site_in.name is not None:
        site.name = site_in.name
    if site_in.security_domain is not None:
        site.security_domain = site_in.security_domain
        
    db.commit()
    db.refresh(site)
    return site

@router.delete("/{site_id}")
def delete_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    db.delete(site)
    db.commit()
    return {"ok": True}
