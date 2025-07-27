"""Quota de migration

Revision ID: a1d46fc21f0a
Revises: e0a54089f5a2
Create Date: 2025-06-28 23:08:45.413544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1d46fc21f0a'
down_revision: Union[str, None] = 'e0a54089f5a2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Ajouter la table ManagerQuota
    op.create_table(
        'manager_quota',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('quota', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('period_start', sa.Date(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('remuneration', sa.Float(), nullable=True),
    )
    # Créer un index pour améliorer les performances sur user_id
    op.create_index(op.f('ix_manager_quota_user_id'), 'manager_quota', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer l'index
    op.drop_index(op.f('ix_manager_quota_user_id'), table_name='manager_quota')
    # Supprimer la table ManagerQuota
    op.drop_table('manager_quota')
