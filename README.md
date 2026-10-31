# dividaControl

Controle financeiro pessoal: contas, cartões (débito e crédito), faturas,
lançamentos de despesas e receitas.

**Status:** em desenvolvimento. Decisões de arquitetura registradas em [`docs/DECISOES.md`](docs/DECISOES.md).

## Stack

- **Backend:** Node.js (Express), Knex.js, PostgreSQL 16, Zod, Vitest + Supertest
- **Frontend:** Vue 3 (Composition API), Vite, Pinia, Vue Router
- **Infraestrutura:** Docker Compose

## Como rodar

```bash
cp .env.example .env        # edite a senha do banco e segredos
docker compose up --build
```

- API: http://localhost:3000
- Saúde: `GET /health` e `GET /health/db`

## Testes e lint

```bash
cd backend
npm install
npm test
npm run lint
```

## Modelo de dados

As tabelas reais são criadas e versionadas por migrações do **Knex.js** (`backend/src/db/migrations`).
A proposta conceitual de referência está em [`docs/schema.sql`](docs/schema.sql).
