"""Add manager role to enum

Revision ID: ecbce9ac41ea
Revises: defc8c924559
Create Date: 2025-06-14 12:03:58.444640

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ecbce9ac41ea'
down_revision: Union[str, None] = 'defc8c924559'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Ajouter 'manager' à l'enum existant
    # op.execute("ALTER TYPE role ADD VALUE 'manager'")
    pass


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer 'manager' (optionnel, avec précaution)
    op.execute("ALTER TYPE role DROP VALUE 'manager'")
    pass
