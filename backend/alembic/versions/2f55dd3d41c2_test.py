"""test

Revision ID: 2f55dd3d41c2
Revises: 3c1a626261d9
Create Date: 2025-06-29 22:14:00.582229

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f55dd3d41c2'
down_revision: Union[str, None] = '3c1a626261d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade():
    # Vérifier si la table existe déjà
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'wash_record' not in tables:
        op.create_table(
            'wash_record',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('wash_date', sa.Date(), nullable=False),
            sa.Column('wash_id', sa.Integer()),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
            sa.UniqueConstraint('wash_id')
        )


def downgrade():
    op.drop_table('wash_record')