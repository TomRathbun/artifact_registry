"""add comment selected_text and resolution_action

Revision ID: add_comment_enhancements
Revises: add_person_name_unique
Create Date: 2025-12-12

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_comment_enhancements'
down_revision = 'add_person_name_unique'
branch_labels = None
depends_on = None


def upgrade():
    # Add selected_text column
    op.add_column('comments', sa.Column('selected_text', sa.String(), nullable=True))
    
    # Add resolution_action column
    op.add_column('comments', sa.Column('resolution_action', sa.String(), nullable=True))


def downgrade():
    # Remove resolution_action column
    op.drop_column('comments', 'resolution_action')
    
    # Remove selected_text column
    op.drop_column('comments', 'selected_text')
