"""add unique constraint to person name

Revision ID: add_person_name_unique
Revises: 
Create Date: 2025-12-07

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_person_name_unique'
down_revision = None  # Update this if there are previous migrations
branch_labels = None
depends_on = None


def upgrade():
    # Add unique constraint on (name, project_id) combination
    # This allows same name across different projects but not within a project
    op.create_unique_constraint(
        'uq_person_name_project',
        'people',
        ['name', 'project_id']
    )


def downgrade():
    # Remove the unique constraint
    op.drop_constraint('uq_person_name_project', 'people', type_='unique')
