"""add_comment_id_default

Revision ID: 8a6a44960292
Revises: 6026e0885dc4
Create Date: 2025-12-07 11:41:59.810353

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a6a44960292'
down_revision: Union[str, Sequence[str], None] = '6026e0885dc4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy import text

def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('comments', 'id', server_default=text("gen_random_uuid()::text"))


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('comments', 'id', server_default=None)
