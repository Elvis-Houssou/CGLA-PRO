"""change image to name

Revision ID: e0a54089f5a2
Revises: f785d43f2ac4
Create Date: 2025-06-14 18:50:29.820914

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0a54089f5a2'
down_revision: Union[str, None] = 'f785d43f2ac4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('offer', sa.Column('icon', sa.VARCHAR, nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    pass
