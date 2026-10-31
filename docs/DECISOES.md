# Registro de Decisões de Arquitetura (ADRs)

Este documento registra as principais decisões técnicas e de arquitetura do projeto **dividaControl**, conforme as regras estabelecidas no `AGENTS.md`.

---

## ADR 001: Escolha da Stack de Backend e Banco de Dados

- **Status:** Aceito
- **Data:** 2026-10-31
- **Contexto:**
  O projeto necessita de uma API REST confiável, leve e segura para controle financeiro pessoal, com forte controle sobre transações ACID, integridade referencial e migrações versionadas.
- **Decisão:**
  - **Runtime & Framework:** Node.js (versão LTS) com Express.
  - **Banco de Dados:** PostgreSQL 16.
  - **Acesso ao Banco e Migrations:** **Knex.js** com driver `pg`. Escolhido em vez de Prisma devido ao controle total sobre o DDL do PostgreSQL (constraints `CHECK`, extensão `citext`, índices compostos), migrações JavaScript/SQL explícitas e auditáveis, transações explícitas e leveza em containers Docker.
  - **Validação de Entrada:** Zod para validação rigorosa de payloads nas rotas antes de alcançar a camada de regras de negócio (`services/`).
  - **Testes:** Vitest + Supertest, apontando para banco de teste isolado.

---

## ADR 002: Modelagem e Manipulação de Valores Monetários

- **Status:** Aceito
- **Data:** 2026-10-31
- **Contexto:**
  O uso de tipos de ponto flutuante (`float`, `double`) causa imprecisões cumulativas de arredondamento inaceitáveis em aplicações financeiras.
- **Decisão:**
  - Nenhum valor financeiro é manipulado ou persistido como ponto flutuante.
  - Valores são representados e calculados estritamente como **centavos (inteiro)**:
    - No PostgreSQL: `INTEGER` ou `BIGINT` com constraint `CHECK (amount_cents > 0)`.
    - No backend (JavaScript/Node.js): `integer` (centavos).
  - O sentido da operação (crédito vs. débito) é determinado pela coluna `type` (`income` para receitas, `expense` para despesas).
  - A conversão e formatação para moeda brasileira (R$) acontece exclusivamente no frontend através de `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

---

## ADR 003: Separação de Ambientes e Isolamento de Testes

- **Status:** Aceito
- **Data:** 2026-10-31
- **Contexto:**
  Testes automatizados não devem interferir nem rodar no mesmo banco de dados de desenvolvimento ou produção.
- **Decisão:**
  - O ambiente de desenvolvimento utiliza o banco `divida_control_dev`.
  - O ambiente de testes automatizados utiliza o banco isolado `divida_control_test`.
  - Credenciais e segredos residem exclusivamente em `.env` (ignorado pelo Git), documentados em `.env.example` com valores fictícios.



---

## ADR 004: Escolha da Stack de Frontend com Vue 3 e Tailwind CSS

- **Status:** Aceito
- **Data:** 2026-10-31
- **Contexto:**
  O projeto requer uma interface web reativa, moderna, modular e agradável para visualização de relatórios, lançamentos de despesas e gestão de contas.
- **Decisão:**
  - **Framework:** Vue 3 utilizando Composition API com a sintaxe `<script setup>`.
  - **Build Tool:** Vite para desenvolvimento rápido e builds otimizados.
  - **Estilização:** Tailwind CSS para design utility-first responsivo e consistente.
  - **Gerenciamento de Estado:** Pinia para stores modulares (ex: autenticação).
  - **Roteamento:** Vue Router com navegação protegida por guardas de rota.
  - **Comunicação HTTP:** Axios encapsulado em `src/services/` como único ponto de chamada à API.
  - **Formatação de Moeda:** Helper centralizado convertendo centavos inteiros via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
  - **Testes:** Vitest.
