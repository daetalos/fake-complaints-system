"""create_complaint_categories_table

Revision ID: dec9078837c8
Revises: 6d3b3a6bef12
Create Date: 2025-06-22 21:44:31.140196

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'dec9078837c8'
down_revision: Union[str, None] = '6d3b3a6bef12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'complaint_categories',
        sa.Column(
            'category_id',
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column('main_category', sa.String(), nullable=False),
        sa.Column('sub_category', sa.String(), nullable=False),
        sa.UniqueConstraint(
            'main_category', 'sub_category', name='uq_main_sub_category'
        )
    )


def downgrade() -> None:
    op.drop_table('complaint_categories')
