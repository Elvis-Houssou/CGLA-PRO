"""table wash record

Revision ID: 6c73b195a0ce
Revises: 45b11db8c1b9
Create Date: 2025-08-21 22:12:05.970693

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6c73b195a0ce'
down_revision: Union[str, None] = '45b11db8c1b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'wash_record',  # ou 'washrecord' si vous avez forcé ce nom
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('manager_id', sa.Integer, sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('wash_date', sa.Date, nullable=False),
        sa.Column('wash_id', sa.Integer, sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
    )
    op.create_foreign_key(
        'fk_wash_record_wash_id_user',
        'wash_record',
        'user',
        ['wash_id'],
        ['id'],
        ondelete='SET NULL'
    )
    # Créer un index pour améliorer les performances sur user_id
    op.create_index(op.f('ix_wash_record_manager_id'), 'wash_record', ['manager_id'], unique=False)
    op.create_unique_constraint('uq_wash_record_wash_id', 'wash_record', ['wash_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_wash_record_manager_id', table_name='wash_record')
    op.drop_constraint('uq_wash_record_wash_id', 'wash_record', type_='unique')
    op.drop_constraint('fk_wash_record_wash_id_user', 'wash_record', type_='foreignkey')
    op.drop_column('wash_record', 'wash_id')
    op.drop_table('wash_record')
