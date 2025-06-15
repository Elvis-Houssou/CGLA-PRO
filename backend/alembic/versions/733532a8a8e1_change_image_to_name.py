"""change image to name

Revision ID: 733532a8a8e1
Revises: ecbce9ac41ea
Create Date: 2025-06-14 18:14:07.554433

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '733532a8a8e1'
down_revision: Union[str, None] = 'ecbce9ac41ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
