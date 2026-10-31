# Controle Financeiro (projeto pessoal)

Aplicação web para controle das minhas finanças pessoais: receitas, despesas, categorias, contas e
relatórios. Frontend em Vue.js, API em Node.js, banco PostgreSQL, tudo rodando com Docker.

Leia este arquivo antes de cada tarefa. Se um pedido entrar em conflito com as regras abaixo,
pare e explique o conflito em vez de seguir.

## Regras que valem sempre

1. **Os dados são financeiros e reais.** Nunca execute `docker compose down -v`, `docker volume rm`,
   `docker system prune`, `DROP`, `TRUNCATE` nem `DELETE` sem `WHERE`. Não apague nem recrie o volume
   do banco.
2. **Mudanças de schema só por migrations versionadas.** Nunca edite uma migration que já foi aplicada;
   crie uma nova. Não rode migrations sem eu pedir.
3. **Segredos:** não leia, imprima nem commite `.env`, senhas, tokens ou chaves. Use `.env.example`
   com valores fictícios. Nenhum segredo em código, logs, testes ou imagens Docker.
4. **Ambientes separados.** O desenvolvimento usa o banco `<NOME_DB_DEV>` e os testes automatizados
   usam `<NOME_DB_TESTE>`, nunca o mesmo. Não aponte código novo para dados reais.
5. **Dinheiro nunca é `float`.** Valores são guardados e calculados em **centavos (inteiro)** ou
   `NUMERIC` no PostgreSQL, e como inteiro em centavos no JavaScript. A formatação em reais acontece
   só na tela.
6. **SQL sempre parametrizado.** Nunca concatenar valores em texto de consulta.
7. **Não instale dependências** nem altere `package.json` e lockfiles sem pedir. Não use `git push`,
   `git reset --hard` nem `git clean`. Faça commit só quando eu pedir.
8. **Dados fictícios.** Exemplos, testes e seeds usam apenas dados inventados. Não registre valores,
   descrições de gastos ou tokens em logs.
9. Não refatore nada fora do escopo pedido.

## Stack

- **Frontend:** Vue 3 (Composition API, `<script setup>`) com tailwind CSS, Vite, Pinia, Vue Router.
  `JavaScript`
- **Backend:** Node.js `VERSÃO LTS`, `Express`, API REST em JSON.
- **Banco:** PostgreSQL `VERSÃO`. Acesso a dados via `<Prisma / Knex / pg>`.
- **Docker:** Docker Compose com os serviços `db`, `api` e `web`.
- **Testes:** `Vitest` no frontend e `Vitest` com `supertest` no backend.
- **Qualidade:** ESLint e Prettier, com a configuração do projeto.

## Estrutura

```
frontend/
  src/
    components/   componentes pequenos e reutilizáveis
    views/        telas (uma por rota)
    stores/       Pinia
    composables/  lógica reutilizável
    services/     chamadas HTTP à API (único lugar que usa fetch/axios)
backend/
  src/
    routes/       rotas e validação de entrada
    services/     regras de negócio
    db/           conexão, migrations e consultas
  tests/
docker-compose.yml
.env.example
docs/             DECISOES.md
```

## Banco de dados

- Nomes em `snake_case`, tabelas no plural, chave primária `id`, colunas `created_at` e `updated_at`
  em `timestamptz`.
- Valor da transação sempre **positivo**, e o sentido vem de uma coluna `type` (`income` ou `expense`).
  Use `CHECK (amount_cents > 0)`. `<CONFIRMAR convenção>`
- Datas de lançamento em `date`; momentos exatos em `timestamptz`. Fuso: `America/Sao_Paulo`.
- Chaves estrangeiras, `NOT NULL` e índices (por exemplo em data e categoria) definidos na migration.
- Operações com mais de um passo (como transferência entre contas) rodam em **transação**.
- Autenticação e usuários: `<DEFINIR>`. Se houver mais de um usuário, toda consulta filtra por
  `user_id`.

## API

- REST, JSON, códigos HTTP corretos, erros no formato `{ "code": "...", "message": "..." }`.
- Validar toda entrada no backend (`<zod / joi>`); nunca confiar no que vem do frontend.
- A regra de negócio fica em `services/`, não nas rotas nem no frontend.

## Frontend

- Componentes pequenos; lógica compartilhada em composables; chamadas HTTP só em `services/`.
- Sem cálculo de dinheiro no template. Exibir valores com `Intl.NumberFormat('pt-BR',
  { style: 'currency', currency: 'BRL' })`, convertendo de centavos.
- Tratar estados de carregando, vazio e erro em toda tela que busca dados.

## Docker

- O Postgres só escuta em `127.0.0.1` (por exemplo `127.0.0.1:5432:5432`), com volume nomeado.
- Imagens com versão fixa (nada de `latest`), `.dockerignore` configurado e `healthcheck` no banco.
- Variáveis de ambiente vêm de `.env` (fora do Git), nunca escritas no `docker-compose.yml`.
- **Pode rodar sem perguntar:** `npm run lint`, `npm test`, `docker compose ps`, `docker compose logs`.
- **Pergunte antes:** `docker compose up/down/build`, migrations e qualquer comando que mude
  containers, volumes ou o banco.

## Como trabalhar

- Uma tarefa pequena por vez. Mostre o plano e espere minha aprovação antes de editar arquivos.
- Escreva ou atualize testes junto com o código, e rode lint e testes antes de dar a tarefa como
  pronta.
- No fim de cada tarefa, liste os arquivos alterados e o que merece minha revisão, principalmente
  migrations e consultas SQL.
- Registre decisões relevantes em `docs/DECISOES.md`.
- Prefira perguntar a assumir. Explique em comentários curtos o que cada trecho novo faz.

## Definição de pronto

- [ ] Lint e testes passam.
- [ ] Nenhum valor monetário usa `float`.
- [ ] Nenhuma migration antiga foi editada.
- [ ] Nenhum segredo ou dado real no código, nos logs ou nos testes.
- [ ] Consultas parametrizadas e entrada validada no backend.
