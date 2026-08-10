from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import DATABASE_URL

class Base(DeclarativeBase):
    pass


connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False,
    }


engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)
Base.metadata.create_all(bind=engine)