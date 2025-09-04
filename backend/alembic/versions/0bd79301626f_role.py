"""role 

Revision ID: 0bd79301626f
Revises: 871e4043906f
Create Date: 2025-09-04 12:43:54.440827

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0bd79301626f'
down_revision: Union[str, None] = '871e4043906f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Étape 1 : Créer le nouveau type temporaire
    op.execute("""
        CREATE TYPE role_temp AS ENUM (
            'super_admin',
            'system_manager',
            'station_owner'
        )
    """)

    # Étape 2 : Supprimer le default actuel
    op.execute('ALTER TABLE "user" ALTER COLUMN role DROP DEFAULT')

    # Étape 3 : Changer le type de la colonne
    op.execute("""
        ALTER TABLE "user" 
        ALTER COLUMN role TYPE role_temp
        USING (role::text::role_temp)
    """)

    # Étape 4 : Supprimer l’ancien type
    op.execute("DROP TYPE role")

    # Étape 5 : Renommer le type temporaire
    op.execute("ALTER TYPE role_temp RENAME TO role")

    # Étape 6 (optionnel) : Redéfinir un default valide
    op.execute("ALTER TABLE \"user\" ALTER COLUMN role SET DEFAULT 'super_admin'")

def downgrade():
    pass