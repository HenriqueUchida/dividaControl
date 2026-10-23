from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

# pool_pre_ping evita erro quando o Postgres reinicia e derruba conexões antigas
engine = create_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


def get_db() -> Iterator[Session]:
    """Dependência do FastAPI: uma sessão por requisição, fechada ao final."""
    with SessionLocal() as session:
        yield session
