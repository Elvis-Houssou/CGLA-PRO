"""change image to name

Revision ID: c3ca89fd3275
Revises: dc6ea776757f
Create Date: 2025-06-14 18:45:41.731844

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3ca89fd3275'
down_revision: Union[str, None] = 'dc6ea776757f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
