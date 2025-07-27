"""Ajout de la table wash_record

Revision ID: e458a15c4bf8
Revises: a305fbe7ae17
Create Date: 2025-06-29 22:27:41.371192

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e458a15c4bf8'
down_revision: Union[str, None] = 'a305fbe7ae17'
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


def downgrade() -> None:
    """Downgrade schema."""
    op.rename_table('washrecord', 'wash_record')
    # ### end Alembic commands ###
