"""repair_use_case_constraints

Revision ID: d5fb701d550d
Revises: 2b5fd9573d1b
Create Date: 2026-01-02 08:47:57.672615

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5fb701d550d'
down_revision: Union[str, Sequence[str], None] = '2b5fd9573d1b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use Case Constraints
    op.execute('ALTER TABLE use_case_preconditions DROP CONSTRAINT IF EXISTS use_case_preconditions_use_case_id_fkey')
    op.execute('ALTER TABLE use_case_preconditions ADD CONSTRAINT use_case_preconditions_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES use_cases(aid) ON DELETE CASCADE')
    
    op.execute('ALTER TABLE use_case_stakeholders DROP CONSTRAINT IF EXISTS use_case_stakeholders_use_case_id_fkey')
    op.execute('ALTER TABLE use_case_stakeholders ADD CONSTRAINT use_case_stakeholders_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES use_cases(aid) ON DELETE CASCADE')
    
    op.execute('ALTER TABLE use_case_postconditions DROP CONSTRAINT IF EXISTS use_case_postconditions_use_case_id_fkey')
    op.execute('ALTER TABLE use_case_postconditions ADD CONSTRAINT use_case_postconditions_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES use_cases(aid) ON DELETE CASCADE')
    
    op.execute('ALTER TABLE use_case_exceptions DROP CONSTRAINT IF EXISTS use_case_exceptions_use_case_id_fkey')
    op.execute('ALTER TABLE use_case_exceptions ADD CONSTRAINT use_case_exceptions_use_case_id_fkey FOREIGN KEY (use_case_id) REFERENCES use_cases(aid) ON DELETE CASCADE')

    # Need Constraints
    op.execute('ALTER TABLE need_sites DROP CONSTRAINT IF EXISTS need_sites_need_id_fkey')
    op.execute('ALTER TABLE need_sites ADD CONSTRAINT need_sites_need_id_fkey FOREIGN KEY (need_id) REFERENCES needs(aid) ON DELETE CASCADE')

    op.execute('ALTER TABLE need_components DROP CONSTRAINT IF EXISTS need_components_need_id_fkey')
    op.execute('ALTER TABLE need_components ADD CONSTRAINT need_components_need_id_fkey FOREIGN KEY (need_id) REFERENCES needs(aid) ON DELETE CASCADE')

    # Diagram Constraints
    op.execute('ALTER TABLE diagram_components DROP CONSTRAINT IF EXISTS diagram_components_diagram_id_fkey')
    op.execute('ALTER TABLE diagram_components ADD CONSTRAINT diagram_components_diagram_id_fkey FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE')

    op.execute('ALTER TABLE diagram_edges DROP CONSTRAINT IF EXISTS diagram_edges_diagram_id_fkey')
    op.execute('ALTER TABLE diagram_edges ADD CONSTRAINT diagram_edges_diagram_id_fkey FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE')


def downgrade() -> None:
    """Downgrade schema."""
    # No-op for now as revert logic is complex and this is a repair
    pass
