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


def upgrade() -> None:
    """Upgrade schema."""
    # Créer la table wash_record
    op.create_table(
        'wash_record',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('wash_date', sa.Date(), nullable=False),
        sa.Column('wash_id', sa.Integer(), nullable=True, unique=True),
    )
   # Créer un index pour améliorer les performances sur user_id
    op.create_index(op.f('ix_wash_record_user_id'), 'wash_record', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer l'index
    op.drop_index(op.f('ix_wash_record_user_id'), table_name='wash_record')
    # Supprimer la table wash_record
    op.drop_table('wash_record')
    # ### end Alembic commands ###
