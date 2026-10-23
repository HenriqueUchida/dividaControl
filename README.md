# dividaControl

Controle financeiro pessoal: contas, cartões (débito e crédito), faturas,
lançamentos de despesas e receitas.

**Status:** em desenvolvimento. Veja o [roteiro](docs/ROADMAP.md).

## Stack

FastAPI · SQLAlchemy 2 · PostgreSQL 16 · Docker Compose · pytest · ruff

## Como rodar

```bash
cp .env.example .env        # edite a senha do banco
docker compose up --build
```

- API: http://localhost:8000
- Documentação interativa: http://localhost:8000/docs
- Saúde: `GET /health` e `GET /health/db`

## Testes e lint

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
ruff check .
```

## Modelo de dados

Proposta inicial em [`docs/schema.sql`](docs/schema.sql). As tabelas reais são
criadas por migrações do Alembic (a partir da etapa 2).
