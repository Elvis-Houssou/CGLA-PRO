"""test 2

Revision ID: a305fbe7ae17
Revises: 2f55dd3d41c2
Create Date: 2025-06-29 22:19:07.435421

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a305fbe7ae17'
down_revision: Union[str, None] = '2f55dd3d41c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass    
def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer l'index
    op.drop_index(op.f('ix_wash_record_user_id'), table_name='wash_record')
    # Supprimer la table wash_record
    op.drop_table('wash_record')
