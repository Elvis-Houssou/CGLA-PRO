"""Update role enum to new values

Revision ID: fea905e9c738
Revises: c45ece8b2c0d
Create Date: 2025-04-19 18:31:19.801316

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'fea905e9c738'
down_revision: Union[str, None] = 'c45ece8b2c0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Supprimer d'abord la contrainte de la colonne role
    op.execute('ALTER TABLE "user" ALTER COLUMN role DROP DEFAULT')
    op.execute('ALTER TABLE "user" ALTER COLUMN role TYPE TEXT USING role::text')
    
    # Maintenant on peut supprimer le type
    op.execute('DROP TYPE role CASCADE')
    
    # Créer le nouveau type enum
    role_enum = sa.Enum(
        "super_admin",
        "system_manager",
        "station_owner",
        "station_manager",
        "car_washer",
        "station_client",
        name='role'
    )
    role_enum.create(op.get_bind())
    
    # Remettre la contrainte sur la colonne
    op.alter_column(
        'user', 
        'role', 
        type_=role_enum,
        postgresql_using='role::role',
        server_default='station_owner'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer le type enum actuel
    op.execute('ALTER TABLE "user" ALTER COLUMN role TYPE TEXT USING role::text')
    op.execute('DROP TYPE role CASCADE')

    # Mettre à jour la colonne role
    op.execute("""
        ALTER TABLE "user" 
        ALTER COLUMN role 
        TYPE role 
        USING role::text::role
    """)