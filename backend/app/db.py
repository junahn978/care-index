import os
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# 1. Load the database URL from backend/.env
load_dotenv("backend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")

# 2. Create the engine (the actual connection pool to Postgres)
engine = create_engine(DATABASE_URL)

# 3. Create a Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Dependency that provides a DB session per request
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db  # Hands the active session to FastAPI
    finally:
        db.close()  # Automatically closes the connection after the request finishes!