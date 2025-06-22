"""add_category_fk_to_complaints

Revision ID: beb1e6faf406
Revises: dec9078837c8
Create Date: 2025-06-22 21:45:37.181601

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'beb1e6faf406'
down_revision: Union[str, None] = 'dec9078837c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'complaints',
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False)
    )
    op.create_foreign_key(
        'fk_complaints_category_id',
        'complaints',
        'complaint_categories',
        ['category_id'],
        ['category_id']
    )


def downgrade() -> None:
    op.drop_constraint('fk_complaints_category_id', 'complaints', type_='foreignkey')
    op.drop_column('complaints', 'category_id')
