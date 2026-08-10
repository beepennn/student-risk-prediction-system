"""add prediction confidence fields

Revision ID: 1d62748aab0b
Revises: fc6b5c90ef1c
Create Date: 2026-07-26 19:53:22.935201

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d62748aab0b'
down_revision: Union[str, Sequence[str], None] = 'fc6b5c90ef1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'predictions',
        sa.Column('confidence', sa.Float(), nullable=True)
    )

    op.add_column(
        'predictions',
        sa.Column('confidence_percentage', sa.Float(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('predictions', 'confidence_percentage')
    op.drop_column('predictions', 'confidence')
