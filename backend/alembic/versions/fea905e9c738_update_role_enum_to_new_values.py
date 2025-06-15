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


def upgrade() -> None:
    """Upgrade schema."""
    # Mapper les anciennes valeurs aux nouvelles
    op.execute("DROP TYPE role")

    # Créer un nouveau type ENUM
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
    # Créer l'ancien type ENUM
    op.execute("DROP TYPE role")

    # Mapper les nouvelles valeurs aux anciennes
    op.execute("""
        CREATE TYPE role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'CLIENT')
    """)

    # Mettre à jour la colonne role
    op.execute("""
        ALTER TABLE "user" 
        ALTER COLUMN role 
        TYPE role 
        USING role::text::role
    """)
