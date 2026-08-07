"""Centralized project content purge for delete and import overwrite."""
from sqlalchemy.orm import Session

from app.db.models.comment import Comment
from app.db.models.component import Component
from app.db.models.diagram import Diagram, DiagramComponent, DiagramEdge
from app.db.models.document import Document
from app.db.models.image import Image
from app.db.models.linkage import Linkage
from app.db.models.metadata import Person
from app.db.models.need import Need, need_components, need_sites
from app.db.models.requirement import Requirement
from app.db.models.use_case import (
    Exception as UCException,
    Postcondition,
    Precondition,
    UseCase,
    use_case_exceptions,
    use_case_postconditions,
    use_case_preconditions,
    use_case_stakeholders,
)
from app.db.models.vision import Vision


def purge_project_content(db: Session, project_id: str, *, delete_project_row: bool = False) -> None:
    """
    Remove all project-scoped artifacts and associations.
    Does not delete shared/global components or sites (those may be referenced elsewhere).
    """
    uc_ids = [
        uc.aid for uc in db.query(UseCase).filter(UseCase.project_id == project_id).all()
    ]
    need_ids = [
        n.aid for n in db.query(Need).filter(Need.project_id == project_id).all()
    ]
    diagram_ids = [
        d.id for d in db.query(Diagram).filter(Diagram.project_id == project_id).all()
    ]
    artifact_aids = set(uc_ids) | set(need_ids)
    artifact_aids |= {
        v.aid for v in db.query(Vision).filter(Vision.project_id == project_id).all()
    }
    artifact_aids |= {
        r.aid
        for r in db.query(Requirement).filter(Requirement.project_id == project_id).all()
    }
    artifact_aids |= {
        d.aid
        for d in db.query(Document).filter(Document.project_id == project_id).all()
    }

    if uc_ids:
        db.execute(
            use_case_preconditions.delete().where(
                use_case_preconditions.c.use_case_id.in_(uc_ids)
            )
        )
        db.execute(
            use_case_postconditions.delete().where(
                use_case_postconditions.c.use_case_id.in_(uc_ids)
            )
        )
        db.execute(
            use_case_exceptions.delete().where(
                use_case_exceptions.c.use_case_id.in_(uc_ids)
            )
        )
        db.execute(
            use_case_stakeholders.delete().where(
                use_case_stakeholders.c.use_case_id.in_(uc_ids)
            )
        )

    if need_ids:
        db.execute(need_sites.delete().where(need_sites.c.need_id.in_(need_ids)))
        db.execute(
            need_components.delete().where(need_components.c.need_id.in_(need_ids))
        )

    if diagram_ids:
        db.query(DiagramEdge).filter(DiagramEdge.diagram_id.in_(diagram_ids)).delete(
            synchronize_session=False
        )
        db.query(DiagramComponent).filter(
            DiagramComponent.diagram_id.in_(diagram_ids)
        ).delete(synchronize_session=False)

    db.query(Linkage).filter(Linkage.project_id == project_id).delete(
        synchronize_session=False
    )

    if artifact_aids:
        db.query(Comment).filter(Comment.artifact_aid.in_(artifact_aids)).delete(
            synchronize_session=False
        )

    db.query(Document).filter(Document.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Image).filter(Image.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Requirement).filter(Requirement.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(UseCase).filter(UseCase.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Need).filter(Need.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Vision).filter(Vision.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Precondition).filter(Precondition.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Postcondition).filter(Postcondition.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(UCException).filter(UCException.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Diagram).filter(Diagram.project_id == project_id).delete(
        synchronize_session=False
    )
    db.query(Person).filter(Person.project_id == project_id).delete(
        synchronize_session=False
    )
    # Project-scoped components only (leave global/null)
    db.query(Component).filter(Component.project_id == project_id).delete(
        synchronize_session=False
    )

    if delete_project_row:
        from app.db.models.project import Project

        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            db.delete(project)
