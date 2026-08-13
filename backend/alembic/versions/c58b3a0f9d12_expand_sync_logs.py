"""expand sync logs

Revision ID: c58b3a0f9d12
Revises: 7d31a6b9c2f4
"""

from typing import (
    Sequence,
    Union,
)

from alembic import op
import sqlalchemy as sa


revision: str = "c58b3a0f9d12"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "7d31a6b9c2f4"

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    op.add_column(
        "policy_sync_logs",
        sa.Column(
            "raw_collected_count",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "policy_sync_logs",
        sa.Column(
            "closed_skipped_count",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "policy_sync_logs",
        sa.Column(
            "closed_deleted_count",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "policy_sync_logs",
        sa.Column(
            "stale_deleted_count",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "policy_sync_logs",
        sa.Column(
            "observed_sources",
            sa.JSON(),
            nullable=True,
        ),
    )

    op.add_column(
        "policy_sync_logs",
        sa.Column(
            "duration_seconds",
            sa.Float(),
            nullable=True,
        ),
    )

    op.execute(
        sa.text(
            """
            UPDATE policy_sync_logs
            SET
                raw_collected_count =
                    collected_count,
                closed_skipped_count = 0,
                closed_deleted_count = 0,
                stale_deleted_count = 0,
                observed_sources = '[]',
                duration_seconds = 0.0
            """
        )
    )

    with op.batch_alter_table(
        "policy_sync_logs"
    ) as batch_op:
        batch_op.alter_column(
            "raw_collected_count",
            existing_type=sa.Integer(),
            nullable=False,
        )

        batch_op.alter_column(
            "closed_skipped_count",
            existing_type=sa.Integer(),
            nullable=False,
        )

        batch_op.alter_column(
            "closed_deleted_count",
            existing_type=sa.Integer(),
            nullable=False,
        )

        batch_op.alter_column(
            "stale_deleted_count",
            existing_type=sa.Integer(),
            nullable=False,
        )

        batch_op.alter_column(
            "observed_sources",
            existing_type=sa.JSON(),
            nullable=False,
        )

        batch_op.alter_column(
            "duration_seconds",
            existing_type=sa.Float(),
            nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table(
        "policy_sync_logs"
    ) as batch_op:
        batch_op.drop_column(
            "duration_seconds"
        )

        batch_op.drop_column(
            "observed_sources"
        )

        batch_op.drop_column(
            "stale_deleted_count"
        )

        batch_op.drop_column(
            "closed_deleted_count"
        )

        batch_op.drop_column(
            "closed_skipped_count"
        )

        batch_op.drop_column(
            "raw_collected_count"
        )