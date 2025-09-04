"""wash_relation

Revision ID: 0e3b3e5c160e
Revises: 69ad893d8e1e
Create Date: 2025-09-02 23:17:26.079408

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0e3b3e5c160e'
down_revision: Union[str, None] = '69ad893d8e1e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Ajouter la colonne user_id
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['role'] for col in inspector.get_columns('user')]

    if 'role' not in columns:
        op.add_column(
            'user',
            sa.Column('user_id', sa.Integer, sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
        )
        # Optionnel : Remplir user_id pour les données existantes
        op.execute("UPDATE car_wash SET user_id = (SELECT id FROM user WHERE role = 'station_owner' LIMIT 1)")
        # Modifier les valeurs du champ role dans la table user pour prendre uniquement 'system_owner'
        op.execute("UPDATE user SET role = 'system_owner' WHERE role IN ('station_owner', 'admin', 'manager')")
        # Optionnel : supprimer les autres rôles qui ne sont pas 'system_owner'
        op.execute("DELETE FROM user WHERE role != 'system_owner'")
    # Ajouter un index si nécessaire
    if not any(idx['name'] == 'ix_car_wash_user_id' for idx in inspector.get_indexes('car_wash')):
        op.create_index('ix_car_wash_user_id', 'car_wash', ['user_id'], unique=False)

def downgrade():
    # Supprimer l'index et la colonne seulement si elles ont été créées
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('car_wash')]
    
    if 'user_id' in columns:
        op.drop_index('ix_car_wash_user_id', table_name='car_wash')
        op.drop_column('car_wash', 'user_id')
