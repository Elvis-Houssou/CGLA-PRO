"""Ajout de la table wash_record

Revision ID: 8c78b0b877d9
Revises: e458a15c4bf8
Create Date: 2025-06-29 22:31:48.762346

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c78b0b877d9'
down_revision: Union[str, None] = 'e458a15c4bf8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_table('wash_record')
    op.create_table(
        'wash_record',  # ou 'washrecord' si vous avez forcé ce nom
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('wash_date', sa.Date, nullable=False),
        sa.Column('wash_id', sa.Integer, nullable=True, unique=True),
    )
    # Créer un index pour améliorer les performances sur user_id
    op.create_index(op.f('ix_wash_record_user_id'), 'wash_record', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.rename_table('washrecord', 'wash_record')
    # ### end Alembic commands ###