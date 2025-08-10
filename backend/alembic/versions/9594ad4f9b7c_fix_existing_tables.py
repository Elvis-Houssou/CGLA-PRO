"""fix_existing_tables

Revision ID: 9594ad4f9b7c
Revises: 0fe34d3c7817
Create Date: 2025-07-28 22:47:23.611422

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9594ad4f9b7c'
down_revision: Union[str, None] = '0fe34d3c7817'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
