"""fix_existing_tables

Revision ID: 0fe34d3c7817
Revises: 8c78b0b877d9
Create Date: 2025-07-28 22:47:03.430353

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0fe34d3c7817'
down_revision: Union[str, None] = '8c78b0b877d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Pour chaque table problématique
    if not op.get_bind().dialect.has_table(op.get_bind(), 'table_name'):
        # Création de la table
        pass

def downgrade():
    # Optionnel
    pass