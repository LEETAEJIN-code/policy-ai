from sqlalchemy import delete, select

from app.database.db import SessionLocal
from app.database.policy_entity import Bookmark
from app.database.policy_entity import PolicyEntity
from app.models.policy import Policy


class BookmarkService:
    def add(
        self,
        user: str,
        policy_id: str,
    ) -> bool:
        with SessionLocal() as session:
            statement = select(Bookmark).where(
                Bookmark.user == user,
                Bookmark.policy_id == policy_id,
            )

            existing = session.scalar(statement)

            if existing is not None:
                return False

            bookmark = Bookmark(
                user=user,
                policy_id=policy_id,
            )

            session.add(bookmark)
            session.commit()

            return True

    def remove(
        self,
        user: str,
        policy_id: str,
    ) -> bool:
        with SessionLocal() as session:
            statement = delete(Bookmark).where(
                Bookmark.user == user,
                Bookmark.policy_id == policy_id,
            )

            result = session.execute(statement)
            session.commit()

            return result.rowcount > 0

    def exists(
        self,
        user: str,
        policy_id: str,
    ) -> bool:
        with SessionLocal() as session:
            statement = select(Bookmark).where(
                Bookmark.user == user,
                Bookmark.policy_id == policy_id,
            )

            return session.scalar(statement) is not None

    def get_policies(
        self,
        user: str,
    ) -> list[Policy]:
        with SessionLocal() as session:
            bookmark_statement = select(
                Bookmark.policy_id
            ).where(
                Bookmark.user == user
            )

            policy_ids = list(
                session.scalars(
                    bookmark_statement
                ).all()
            )

            if not policy_ids:
                return []

            policy_statement = select(
                PolicyEntity
            ).where(
                PolicyEntity.source_id.in_(
                    policy_ids
                )
            )

            entities = list(
                session.scalars(
                    policy_statement
                ).all()
            )

            return [
                Policy(
                    id=entity.source_id,
                    source=entity.source,
                    title=entity.title,
                    organization=entity.organization,
                    description=entity.description,
                    detail_url=entity.detail_url,
                    regions=entity.regions or [],
                    targets=entity.targets or [],
                    support_types=(
                        entity.support_types or []
                    ),
                    keywords=entity.keywords or [],
                    age_min=entity.age_min,
                    age_max=entity.age_max,
                    start_date=entity.start_date,
                    end_date=entity.end_date,
                    required_documents=(
                        entity.required_documents or []
                    ),
                    original_target_text=(
                        entity.original_target_text
                    ),
                    original_period_text=(
                        entity.original_period_text
                    ),
                )
                for entity in entities
            ]