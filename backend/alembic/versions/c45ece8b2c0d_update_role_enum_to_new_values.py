"""Update role enum to new values

Revision ID: c45ece8b2c0d
Revises: 5e8769df66b0
Create Date: 2025-04-19 18:26:02.418715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c45ece8b2c0d'
down_revision: Union[str, None] = '5e8769df66b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Supprimer l'ancien type ENUM
    op.execute("DROP TYPE role")

    # Créer le nouveau type ENUM
    op.execute("""
        CREATE TYPE role AS ENUM ('super_admin', 'admin_garage', 'employee_garage', 'client_garage')
    """)

    # Mettre à jour la colonne role
    op.execute("""
        ALTER TABLE "user" 
        ALTER COLUMN role 
        TYPE role 
        USING role::text::role
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer le type actuel
    op.execute("DROP TYPE role")

    # Restaurer l'ancien type
    op.execute("""
        CREATE TYPE role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'CLIENT')
    """)

    # Mettre à jour la colonne
    op.execute("""
        ALTER TABLE "user" 
        ALTER COLUMN role 
        TYPE role 
        USING role::text::role
    """)
