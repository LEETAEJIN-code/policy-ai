from datetime import date, timedelta

from sqlalchemy import func, or_, select

from app.database.db import SessionLocal
from app.database.policy_entity import PolicyEntity
from app.models.policy import Policy


class PolicyDbService:
    def save_all(
        self,
        policies: list[Policy],
    ) -> dict[str, int]:
        inserted_count = 0
        updated_count = 0

        with SessionLocal() as session:
            for policy in policies:
                unique_id = (
                    f"{policy.source}:{policy.id}"
                )

                entity = session.get(
                    PolicyEntity,
                    unique_id,
                )

                if entity is None:
                    entity = PolicyEntity(
                        unique_id=unique_id,
                        source_id=policy.id,
                        source=policy.source,
                        title=policy.title,
                    )

                    session.add(entity)
                    inserted_count += 1
                else:
                    updated_count += 1

                entity.source_id = policy.id
                entity.source = policy.source
                entity.title = policy.title
                entity.organization = (
                    policy.organization
                )
                entity.description = (
                    policy.description
                )
                entity.detail_url = (
                    policy.detail_url
                )
                entity.regions = (
                    policy.regions
                )
                entity.targets = (
                    policy.targets
                )
                entity.support_types = (
                    policy.support_types
                )
                entity.keywords = (
                    policy.keywords
                )
                entity.age_min = (
                    policy.age_min
                )
                entity.age_max = (
                    policy.age_max
                )
                entity.start_date = (
                    policy.start_date
                )
                entity.end_date = (
                    policy.end_date
                )
                entity.required_documents = (
                    policy.required_documents
                )
                entity.original_target_text = (
                    policy.original_target_text
                )
                entity.original_period_text = (
                    policy.original_period_text
                )

            session.commit()

        return {
            "inserted_count":
                inserted_count,

            "updated_count":
                updated_count,
        }

    def get_all(
        self,
        include_closed: bool = False,
    ) -> list[Policy]:
        today = date.today().isoformat()
        with SessionLocal() as session:
            statement = select(
                PolicyEntity,
            )

            if not include_closed:
                statement = (
                    statement.where(
                        or_(
                            PolicyEntity
                            .end_date
                            .is_(None),

                            PolicyEntity
                            .end_date
                            == "",

                            PolicyEntity
                            .end_date
                            >= today,
                        )
                    )
                )

            statement = (
                statement.order_by(
                    PolicyEntity
                    .end_date
                    .asc(),

                    PolicyEntity
                    .start_date
                    .desc(),
                )
            )

            entities = list(
                session
                .scalars(statement)
                .all()
            )

        return [
            self.to_policy(entity)
            for entity in entities
        ]

    def count(self) -> int:
        with SessionLocal() as session:
            statement = select(
                func.count(
                    PolicyEntity.unique_id,
                )
            )

            result = session.scalar(
                statement,
            )

            return int(result or 0)

    def get_statistics(
        self,
        today: date | None = None,
    ) -> dict[str, int]:
        """
        정책 전체 통계를 DB에서 한 번에 계산한다.

        분류 기준:
        - available:
          종료일이 오늘 이후인 정책
        - deadline_approaching:
          오늘부터 7일 안에 마감되는 정책
        - closed:
          종료일이 오늘보다 이전인 정책
        - date_unknown:
          종료일이 없거나 빈 문자열인 정책
        """
        reference_date = (
            today
            or date.today()
        )

        today_string = (
            reference_date.isoformat()
        )

        deadline_limit_string = (
            reference_date
            + timedelta(days=7)
        ).isoformat()

        unknown_condition = or_(
            PolicyEntity
            .end_date
            .is_(None),

            PolicyEntity
            .end_date
            == "",
        )

        with SessionLocal() as session:
            total_statement = select(
                func.count(
                    PolicyEntity.unique_id,
                )
            )

            available_statement = select(
                func.count(
                    PolicyEntity.unique_id,
                )
            ).where(
                PolicyEntity.end_date
                .is_not(None),

                PolicyEntity.end_date
                != "",

                PolicyEntity.end_date
                >= today_string,
            )

            deadline_statement = select(
                func.count(
                    PolicyEntity.unique_id,
                )
            ).where(
                PolicyEntity.end_date
                .is_not(None),

                PolicyEntity.end_date
                != "",

                PolicyEntity.end_date
                >= today_string,

                PolicyEntity.end_date
                <= deadline_limit_string,
            )

            closed_statement = select(
                func.count(
                    PolicyEntity.unique_id,
                )
            ).where(
                PolicyEntity.end_date
                .is_not(None),

                PolicyEntity.end_date
                != "",

                PolicyEntity.end_date
                < today_string,
            )

            unknown_statement = select(
                func.count(
                    PolicyEntity.unique_id,
                )
            ).where(
                unknown_condition,
            )

            total = int(
                session.scalar(
                    total_statement,
                )
                or 0
            )

            available = int(
                session.scalar(
                    available_statement,
                )
                or 0
            )

            deadline_approaching = int(
                session.scalar(
                    deadline_statement,
                )
                or 0
            )

            closed = int(
                session.scalar(
                    closed_statement,
                )
                or 0
            )

            date_unknown = int(
                session.scalar(
                    unknown_statement,
                )
                or 0
            )

        return {
            "total":
                total,

            "available":
                available,

            "deadline_approaching":
                deadline_approaching,

            "closed":
                closed,

            "date_unknown":
                date_unknown,
        }

    def to_policy(
        self,
        entity: PolicyEntity,
    ) -> Policy:
        return Policy(
            id=entity.source_id,
            source=entity.source,
            title=entity.title,

            organization=(
                entity.organization
            ),

            description=(
                entity.description
            ),

            detail_url=(
                entity.detail_url
            ),

            regions=(
                entity.regions
                or []
            ),

            targets=(
                entity.targets
                or []
            ),

            support_types=(
                entity.support_types
                or []
            ),

            keywords=(
                entity.keywords
                or []
            ),

            age_min=entity.age_min,
            age_max=entity.age_max,

            start_date=(
                entity.start_date
            ),

            end_date=(
                entity.end_date
            ),

            required_documents=(
                entity.required_documents
                or []
            ),

            original_target_text=(
                entity.original_target_text
            ),

            original_period_text=(
                entity.original_period_text
            ),
        )

    def get_by_id(
        self,
        policy_id: str,
    ) -> Policy | None:
        with SessionLocal() as session:
            statement = (
                select(
                    PolicyEntity,
                )
                .where(
                    PolicyEntity
                    .source_id
                    == policy_id
                )
            )

            entity = session.scalar(
                statement,
            )

            if entity is None:
                return None

            return self.to_policy(
                entity,
            )

    def search(
        self,
        keyword: str | None = None,
        region: str | None = None,
        target: str | None = None,
        support_type: str | None = None,
        source: str | None = None,
        organization: str | None = None,
        include_closed: bool = False,
        today: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[Policy], int]:
        with SessionLocal() as session:
            statement = select(
                PolicyEntity,
            )

            if keyword:
                normalized_keyword = (
                    keyword.strip()
                )

                if normalized_keyword:
                    statement = (
                        statement.where(
                            or_(
                                PolicyEntity
                                .title
                                .contains(
                                    normalized_keyword,
                                ),

                                PolicyEntity
                                .organization
                                .contains(
                                    normalized_keyword,
                                ),

                                PolicyEntity
                                .description
                                .contains(
                                    normalized_keyword,
                                ),
                            )
                        )
                    )

            if organization:
                normalized_organization = (
                    organization.strip()
                )

                if normalized_organization:
                    statement = (
                        statement.where(
                            PolicyEntity
                            .organization
                            .contains(
                                normalized_organization,
                            )
                        )
                    )

            if source:
                normalized_source = (
                    source.strip()
                )

                if normalized_source:
                    statement = (
                        statement.where(
                            PolicyEntity.source
                            == normalized_source
                        )
                    )

            if region:
                normalized_region = (
                    region.strip()
                )

                if normalized_region:
                    statement = (
                        statement.where(
                            PolicyEntity
                            .regions
                            .contains(
                                [normalized_region],
                            )
                        )
                    )

            if target:
                normalized_target = (
                    target.strip()
                )

                if normalized_target:
                    statement = (
                        statement.where(
                            PolicyEntity
                            .targets
                            .contains(
                                [normalized_target],
                            )
                        )
                    )

            if support_type:
                normalized_support_type = (
                    support_type.strip()
                )

                if normalized_support_type:
                    statement = (
                        statement.where(
                            PolicyEntity
                            .support_types
                            .contains(
                                [
                                    normalized_support_type
                                ],
                            )
                        )
                    )

            if (
                not include_closed
                and today
            ):
                statement = (
                    statement.where(
                        or_(
                            PolicyEntity
                            .end_date
                            .is_(None),

                            PolicyEntity
                            .end_date
                            == "",

                            PolicyEntity
                            .end_date
                            >= today,
                        )
                    )
                )

            count_statement = (
                select(
                    func.count(),
                )
                .select_from(
                    statement
                    .order_by(None)
                    .subquery()
                )
            )

            total = int(
                session.scalar(
                    count_statement,
                )
                or 0
            )

            statement = (
                statement
                .order_by(
                    PolicyEntity
                    .end_date
                    .asc(),

                    PolicyEntity
                    .start_date
                    .desc(),
                )
                .offset(
                    (page - 1)
                    * per_page
                )
                .limit(
                    per_page,
                )
            )

            entities = list(
                session
                .scalars(statement)
                .all()
            )

        return (
            [
                self.to_policy(entity)
                for entity in entities
            ],
            total,
        )