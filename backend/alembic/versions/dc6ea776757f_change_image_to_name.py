"""change image to name

Revision ID: dc6ea776757f
Revises: 733532a8a8e1
Create Date: 2025-06-14 18:39:18.842746

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc6ea776757f'
down_revision: Union[str, None] = '733532a8a8e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('benefit', 'image',
        new_column_name='icon',
        existing_type=sa.VARCHAR(),
        nullable=True
    )
    op.add_column('offer', sa.Column('icon', sa.VARCHAR, nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('benefit', 'icon', 
        new_column_name='image',
        existing_type=sa.VARCHAR(),
        nullable=False)
    op.drop_column('offer', 'icon')
