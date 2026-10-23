from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db

app = FastAPI(title="dividaControl API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    """A aplicação está de pé (não consulta o banco)."""
    return {"status": "ok"}


@app.get("/health/db")
def health_db(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    """A aplicação consegue falar com o banco."""
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="banco indisponível") from exc
    return {"status": "ok", "database": "ok"}
