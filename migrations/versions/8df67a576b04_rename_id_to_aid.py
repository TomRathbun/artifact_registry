"""rename id to aid

Revision ID: 8df67a576b04
Revises: 
Create Date: 2025-11-14 14:07:46.841417

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8df67a576b04'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
# List of tables that have the old `id` column
TABLES = ["users", "visions", "needs", "use_cases", "requirements", "linkages"]

def upgrade():
    for table in TABLES:
        if op.get_bind().dialect.has_table(op.get_bind(), table):
            op.alter_column(table, "id", new_column_name="aid", existing_type=sa.String())

def downgrade():
    for table in TABLES:
        if op.get_bind().dialect.has_table(op.get_bind(), table):
            op.alter_column(table, "aid", new_column_name="id", existing_type=sa.String())