"""initial schema

Revision ID: 4ba1ed1ee66b
Revises:
Create Date: 2026-08-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4ba1ed1ee66b"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = None

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
    bind = op.get_bind()

    inspector = sa.inspect(
        bind
    )

    existing_tables = set(
        inspector.get_table_names()
    )

    if "bookmarks" not in existing_tables:
        op.create_table(
            "bookmarks",
            sa.Column(
                "id",
                sa.Integer(),
                autoincrement=True,
                nullable=False,
            ),
            sa.Column(
                "user",
                sa.String(),
                nullable=False,
            ),
            sa.Column(
                "policy_id",
                sa.String(),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint(
                "id"
            ),
        )

    if "policies" not in existing_tables:
        op.create_table(
            "policies",
            sa.Column(
                "unique_id",
                sa.String(
                    length=300
                ),
                nullable=False,
            ),
            sa.Column(
                "source_id",
                sa.String(
                    length=200
                ),
                nullable=False,
            ),
            sa.Column(
                "source",
                sa.String(
                    length=50
                ),
                nullable=False,
            ),
            sa.Column(
                "title",
                sa.String(
                    length=500
                ),
                nullable=False,
            ),
            sa.Column(
                "organization",
                sa.String(
                    length=300
                ),
                nullable=True,
            ),
            sa.Column(
                "description",
                sa.Text(),
                nullable=True,
            ),
            sa.Column(
                "detail_url",
                sa.Text(),
                nullable=True,
            ),
            sa.Column(
                "regions",
                sa.JSON(),
                nullable=False,
            ),
            sa.Column(
                "targets",
                sa.JSON(),
                nullable=False,
            ),
            sa.Column(
                "support_types",
                sa.JSON(),
                nullable=False,
            ),
            sa.Column(
                "keywords",
                sa.JSON(),
                nullable=False,
            ),
            sa.Column(
                "age_min",
                sa.Integer(),
                nullable=True,
            ),
            sa.Column(
                "age_max",
                sa.Integer(),
                nullable=True,
            ),
            sa.Column(
                "start_date",
                sa.String(
                    length=20
                ),
                nullable=True,
            ),
            sa.Column(
                "end_date",
                sa.String(
                    length=20
                ),
                nullable=True,
            ),
            sa.Column(
                "required_documents",
                sa.JSON(),
                nullable=False,
            ),
            sa.Column(
                "original_target_text",
                sa.Text(),
                nullable=True,
            ),
            sa.Column(
                "original_period_text",
                sa.Text(),
                nullable=True,
            ),
            sa.PrimaryKeyConstraint(
                "unique_id"
            ),
        )

    if (
        "policy_sync_logs"
        not in existing_tables
    ):
        op.create_table(
            "policy_sync_logs",
            sa.Column(
                "id",
                sa.Integer(),
                autoincrement=True,
                nullable=False,
            ),
            sa.Column(
                "status",
                sa.String(
                    length=20
                ),
                nullable=False,
            ),
            sa.Column(
                "collected_count",
                sa.Integer(),
                nullable=False,
            ),
            sa.Column(
                "inserted_count",
                sa.Integer(),
                nullable=False,
            ),
            sa.Column(
                "updated_count",
                sa.Integer(),
                nullable=False,
            ),
            sa.Column(
                "error_message",
                sa.Text(),
                nullable=True,
            ),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint(
                "id"
            ),
        )


def downgrade() -> None:
    raise RuntimeError(
        "초기 마이그레이션의 downgrade는 "
        "기존 운영 데이터를 보호하기 위해 "
        "비활성화되어 있습니다."
    )