from app.database.db import Base, engine
from app.database.policy_entity import PolicyEntity


def create_tables() -> None:
    Base.metadata.create_all(
        bind=engine,
    )