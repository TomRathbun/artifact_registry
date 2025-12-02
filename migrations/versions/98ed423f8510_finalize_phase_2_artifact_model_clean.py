"""finalize Phase 2 artifact model (clean)

Revision ID: 98ed423f8510
Revises: 8df67a576b04
Create Date: 2025-11-18 15:36:35.613602

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '98ed423f8510'
down_revision: Union[str, Sequence[str], None] = '8df67a576b04'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Add missing columns (only if not present)
    needs_cols = [c['name'] for c in inspector.get_columns('needs')]
    if 'rationale' not in needs_cols:
        op.add_column('needs', sa.Column('rationale', sa.Text(), nullable=True))
    if 'owner' not in needs_cols:
        op.add_column('needs', sa.Column('owner', sa.String(), nullable=True))
    if 'stakeholder' not in needs_cols:
        op.add_column('needs', sa.Column('stakeholder', sa.String(), nullable=True))

    req_cols = [c['name'] for c in inspector.get_columns('requirements')]
    if 'rationale' not in req_cols:
        op.add_column('requirements', sa.Column('rationale', sa.Text(), nullable=True))
    if 'owner' not in req_cols:
        op.add_column('requirements', sa.Column('owner', sa.String(), nullable=True))

    # Drop legacy columns from visions and use_cases
    for table in ['visions', 'use_cases']:
        cols = [c['name'] for c in inspector.get_columns(table)]
        for col in ['links', 'rationale', 'owner']:
            if col in cols:
                with op.batch_alter_table(table) as batch_op:
                    batch_op.drop_column(col)


def downgrade():
    # Reverse (for rollback)
    op.add_column('visions', sa.Column('links', sa.JSON(), nullable=True))
    op.add_column('visions', sa.Column('rationale', sa.Text(), nullable=True))
    op.add_column('visions', sa.Column('owner', sa.String(), nullable=True))
    op.add_column('use_cases', sa.Column('links', sa.JSON(), nullable=True))
    op.add_column('use_cases', sa.Column('rationale', sa.Text(), nullable=True))
    op.add_column('use_cases', sa.Column('owner', sa.String(), nullable=True))

    op.drop_column('needs', 'stakeholder')
    op.drop_column('needs', 'owner')
    op.drop_column('needs', 'rationale')
    op.drop_column('requirements', 'owner')
    op.drop_column('requirements', 'rationale')
