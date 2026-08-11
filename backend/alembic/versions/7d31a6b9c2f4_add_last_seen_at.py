"""add last_seen_at to policies

Revision ID: 7d31a6b9c2f4
Revises: 4ba1ed1ee66b
"""

from alembic import op
import sqlalchemy as sa


revision: str = "7d31a6b9c2f4"
down_revision: str | None = "4ba1ed1ee66b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "policies",
        sa.Column(
            "last_seen_at",
            sa.DateTime(
                timezone=True
            ),
            nullable=True,
        ),
    )

    # 기존 정책은 마이그레이션 실행 시각으로 초기화한다.
    # 따라서 배포 직후 기존 정책이 삭제되지 않는다.
    op.execute(
        sa.text(
            """
            UPDATE policies
            SET last_seen_at = CURRENT_TIMESTAMP
            WHERE last_seen_at IS NULL
            """
        )
    )

    with op.batch_alter_table(
        "policies"
    ) as batch_op:
        batch_op.alter_column(
            "last_seen_at",
            existing_type=sa.DateTime(
                timezone=True
            ),
            nullable=False,
        )

        batch_op.create_index(
            "ix_policies_last_seen_at",
            [
                "last_seen_at",
            ],
            unique=False,
        )


def downgrade() -> None:
    with op.batch_alter_table(
        "policies"
    ) as batch_op:
        batch_op.drop_index(
            "ix_policies_last_seen_at"
        )

        batch_op.drop_column(
            "last_seen_at"
        )