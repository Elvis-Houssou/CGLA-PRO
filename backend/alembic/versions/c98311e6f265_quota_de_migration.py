"""Quota de migration

Revision ID: c98311e6f265
Revises: a1d46fc21f0a
Create Date: 2025-06-28 23:12:00.006254

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c98311e6f265'
down_revision: Union[str, None] = 'a1d46fc21f0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Vérifier si la table existe déjà
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'manager_quota' not in tables:
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
    else:
        print("Table manager_quota already exists, skipping creation")


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer l'index
    op.drop_index(op.f('ix_manager_quota_user_id'), table_name='manager_quota')
    # Supprimer la table ManagerQuota
    op.drop_table('manager_quota')
