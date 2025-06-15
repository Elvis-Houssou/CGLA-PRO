"""change image to name

Revision ID: f785d43f2ac4
Revises: c3ca89fd3275
Create Date: 2025-06-14 18:50:04.347796

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f785d43f2ac4'
down_revision: Union[str, None] = 'c3ca89fd3275'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
