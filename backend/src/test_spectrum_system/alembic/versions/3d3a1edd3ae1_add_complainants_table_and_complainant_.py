"""add_complainants_table_and_complainant_fk_to_complaints

Revision ID: 3d3a1edd3ae1
Revises: 4ffc07840df0
Create Date: 2025-06-23 18:58:02.535892

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '3d3a1edd3ae1'
down_revision: Union[str, None] = '4ffc07840df0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('complainants',
    sa.Column('complainant_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('phone', sa.String(length=50), nullable=True),
    sa.Column('address_line1', sa.String(length=255), nullable=False),
    sa.Column('address_line2', sa.String(length=255), nullable=True),
    sa.Column('city', sa.String(length=100), nullable=False),
    sa.Column('postcode', sa.String(length=20), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True),
              server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True),
              server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('complainant_id')
    )
    op.create_index('idx_complainant_city', 'complainants', ['city'], unique=False)
    op.create_index('idx_complainant_email', 'complainants', ['email'], unique=False)
    op.create_index('idx_complainant_postcode', 'complainants',
                    ['postcode'], unique=False)
    op.add_column('complaints', sa.Column('complainant_id', sa.UUID(), nullable=False))
    op.create_foreign_key(None, 'complaints', 'complainants',
                          ['complainant_id'], ['complainant_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'complaints', type_='foreignkey')
    op.drop_column('complaints', 'complainant_id')
    op.drop_index('idx_complainant_postcode', table_name='complainants')
    op.drop_index('idx_complainant_email', table_name='complainants')
    op.drop_index('idx_complainant_city', table_name='complainants')
    op.drop_table('complainants')
    # ### end Alembic commands ###
