from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.db import get_db
from app.main import app

client = TestClient(app)


class SessaoOk:
    def execute(self, *args, **kwargs):
        return None


class SessaoComFalha:
    def execute(self, *args, **kwargs):
        raise OperationalError("SELECT 1", {}, Exception("conexão recusada"))


def test_health_responde_ok():
    resposta = client.get("/health")
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}


def test_health_db_ok():
    app.dependency_overrides[get_db] = lambda: SessaoOk()
    try:
        resposta = client.get("/health/db")
    finally:
        app.dependency_overrides.clear()
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok", "database": "ok"}


def test_health_db_retorna_503_quando_banco_cai():
    app.dependency_overrides[get_db] = lambda: SessaoComFalha()
    try:
        resposta = client.get("/health/db")
    finally:
        app.dependency_overrides.clear()
    assert resposta.status_code == 503
