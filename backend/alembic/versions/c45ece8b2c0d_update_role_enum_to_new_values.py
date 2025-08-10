"""Update role enum to new values

Revision ID: c45ece8b2c0d
Revises: 5e8769df66b0
Create Date: 2025-04-19 18:26:02.418715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c45ece8b2c0d'
down_revision: Union[str, None] = '5e8769df66b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Supprimer d'abord la contrainte de la colonne role
    op.execute('ALTER TABLE "user" ALTER COLUMN role DROP DEFAULT')
    op.execute('ALTER TABLE "user" ALTER COLUMN role TYPE TEXT USING role::text')
    
    # Maintenant on peut supprimer le type
    op.execute('DROP TYPE role CASCADE')
    
    # Créer le nouveau type enum
    role_enum = sa.Enum(
        'super_admin', 
        'manager', 
        'admin_garage', 
        'employee_garage', 
        'client_garage', 
        name='role'
    )
    role_enum.create(op.get_bind())
    
    # Remettre la contrainte sur la colonne
    op.alter_column(
        'user', 
        'role', 
        type_=role_enum,
        postgresql_using='role::role',
        server_default='admin_garage'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer le type actuel
    op.execute("DROP TYPE role")

    # Restaurer l'ancien type
    op.execute("""
        CREATE TYPE role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'CLIENT')
    """)

    # Mettre à jour la colonne
    op.execute("""
        ALTER TABLE "user" 
        ALTER COLUMN role 
        TYPE role 
        USING role::text::role
    """)
