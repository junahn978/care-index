from sqlalchemy.orm import DeclarativeBase

# every model shares this Base, so Alembic sees all tables through one Base.metadata
class Base(DeclarativeBase):
    pass
