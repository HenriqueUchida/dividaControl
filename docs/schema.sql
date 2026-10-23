-- =============================================================================
-- dividaControl - esquema PostgreSQL (proposta v1)
-- Referência de modelagem. No projeto real, gere isso com SQLAlchemy + Alembic
-- (migrations versionadas) em vez de rodar este arquivo na mão.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS citext;   -- e-mail sem diferenciar maiúsculas

-- -----------------------------------------------------------------------------
-- Usuários
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          text        NOT NULL,
    email         citext      NOT NULL UNIQUE,
    senha_hash    text        NOT NULL,              -- argon2/bcrypt, nunca a senha
    ativo         boolean     NOT NULL DEFAULT true,
    criado_em     timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Contas bancárias
-- -----------------------------------------------------------------------------
CREATE TABLE contas (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id    uuid        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome          text        NOT NULL,              -- ex.: "Nubank", "Carteira"
    tipo          text        NOT NULL DEFAULT 'CORRENTE'
                  CHECK (tipo IN ('CORRENTE','POUPANCA','CARTEIRA','INVESTIMENTO')),
    saldo_inicial numeric(14,2) NOT NULL DEFAULT 0,
    ativa         boolean     NOT NULL DEFAULT true,
    criado_em     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, nome),
    UNIQUE (usuario_id, id)                          -- alvo das FKs compostas
);

-- -----------------------------------------------------------------------------
-- Cartões (débito e crédito)
--   DÉBITO : debita de uma conta (conta_id obrigatório)
--   CRÉDITO: tem limite, fechamento e vencimento; conta_id = conta que paga a fatura
-- -----------------------------------------------------------------------------
CREATE TABLE cartoes (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      uuid        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conta_id        uuid,
    nome            text        NOT NULL,
    tipo            text        NOT NULL CHECK (tipo IN ('CREDITO','DEBITO')),
    bandeira        text,
    limite          numeric(14,2),
    dia_fechamento  smallint    CHECK (dia_fechamento BETWEEN 1 AND 31),
    dia_vencimento  smallint    CHECK (dia_vencimento BETWEEN 1 AND 31),
    ativo           boolean     NOT NULL DEFAULT true,
    criado_em       timestamptz NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, nome),
    UNIQUE (usuario_id, id),
    FOREIGN KEY (usuario_id, conta_id) REFERENCES contas (usuario_id, id),
    CHECK (
        (tipo = 'DEBITO'  AND conta_id IS NOT NULL)
        OR
        (tipo = 'CREDITO' AND limite IS NOT NULL
                          AND dia_fechamento IS NOT NULL
                          AND dia_vencimento IS NOT NULL)
    )
);

-- -----------------------------------------------------------------------------
-- Categorias
-- -----------------------------------------------------------------------------
CREATE TABLE categorias (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome        text NOT NULL,
    tipo        text NOT NULL CHECK (tipo IN ('DESPESA','RECEITA')),
    ativa       boolean NOT NULL DEFAULT true,
    UNIQUE (usuario_id, tipo, nome),
    UNIQUE (usuario_id, id)
);

-- -----------------------------------------------------------------------------
-- Faturas do cartão de crédito
--   Uma por cartão por mês. As compras no crédito apontam para a fatura.
--   Pagar a fatura NÃO cria uma despesa nova (evita contar o gasto duas vezes);
--   o pagamento sai da conta via pago_em / conta_pagamento_id (ver v_saldo_contas).
-- -----------------------------------------------------------------------------
CREATE TABLE faturas (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id           uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cartao_id            uuid NOT NULL,
    mes_referencia       date NOT NULL CHECK (mes_referencia = date_trunc('month', mes_referencia)::date),
    data_fechamento      date NOT NULL,
    data_vencimento      date NOT NULL,
    status               text NOT NULL DEFAULT 'ABERTA'
                         CHECK (status IN ('ABERTA','FECHADA','PAGA')),
    pago_em              date,
    conta_pagamento_id   uuid,
    criado_em            timestamptz NOT NULL DEFAULT now(),
    UNIQUE (cartao_id, mes_referencia),
    UNIQUE (usuario_id, id),
    FOREIGN KEY (usuario_id, cartao_id)          REFERENCES cartoes (usuario_id, id),
    FOREIGN KEY (usuario_id, conta_pagamento_id) REFERENCES contas  (usuario_id, id),
    CHECK ((status = 'PAGA') = (pago_em IS NOT NULL AND conta_pagamento_id IS NOT NULL))
);

-- -----------------------------------------------------------------------------
-- Lançamentos recorrentes (seus "gastos fixos")
--   Um job mensal (Celery) gera os lançamentos a partir destas regras.
-- -----------------------------------------------------------------------------
CREATE TABLE lancamentos_recorrentes (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id       uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo             text NOT NULL CHECK (tipo IN ('DESPESA','RECEITA')),
    descricao        text NOT NULL,
    valor            numeric(14,2) NOT NULL CHECK (valor > 0),
    categoria_id     uuid,
    forma_pagamento  text NOT NULL
                     CHECK (forma_pagamento IN ('CREDITO','DEBITO','PIX','DINHEIRO','BOLETO','TRANSFERENCIA')),
    conta_id         uuid,
    cartao_id        uuid,
    dia_vencimento   smallint NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
    data_inicio      date NOT NULL,
    data_fim         date,
    ativo            boolean NOT NULL DEFAULT true,
    UNIQUE (usuario_id, id),
    FOREIGN KEY (usuario_id, categoria_id) REFERENCES categorias (usuario_id, id),
    FOREIGN KEY (usuario_id, conta_id)     REFERENCES contas     (usuario_id, id),
    FOREIGN KEY (usuario_id, cartao_id)    REFERENCES cartoes    (usuario_id, id),
    CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- -----------------------------------------------------------------------------
-- Lançamentos (despesas e receitas)
--   valor é sempre positivo; o sinal vem do campo "tipo".
--   Crédito  -> cartao_id + fatura_id, sem conta_id, sem data_pagamento
--   Demais   -> conta_id (cartao_id opcional no débito); data_pagamento NULL = pendente
--   Parcelas -> uma linha por parcela, ligadas por grupo_parcela_id
-- -----------------------------------------------------------------------------
CREATE TABLE lancamentos (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id        uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo              text NOT NULL CHECK (tipo IN ('DESPESA','RECEITA')),
    descricao         text NOT NULL,
    valor             numeric(14,2) NOT NULL CHECK (valor > 0),
    categoria_id      uuid,
    forma_pagamento   text NOT NULL
                      CHECK (forma_pagamento IN ('CREDITO','DEBITO','PIX','DINHEIRO','BOLETO','TRANSFERENCIA')),
    conta_id          uuid,
    cartao_id         uuid,
    fatura_id         uuid,
    data_lancamento   date NOT NULL DEFAULT current_date,   -- quando aconteceu
    data_vencimento   date NOT NULL,                        -- quando vence / entra
    data_pagamento    date,
    observacao        text,
    grupo_parcela_id  uuid,
    parcela_numero    smallint,
    parcela_total     smallint,
    recorrente_id     uuid,
    criado_em         timestamptz NOT NULL DEFAULT now(),
    atualizado_em     timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (usuario_id, categoria_id)  REFERENCES categorias (usuario_id, id),
    FOREIGN KEY (usuario_id, conta_id)      REFERENCES contas     (usuario_id, id),
    FOREIGN KEY (usuario_id, cartao_id)     REFERENCES cartoes    (usuario_id, id),
    FOREIGN KEY (usuario_id, fatura_id)     REFERENCES faturas    (usuario_id, id),
    FOREIGN KEY (usuario_id, recorrente_id) REFERENCES lancamentos_recorrentes (usuario_id, id),
    CHECK (
        (forma_pagamento = 'CREDITO' AND tipo = 'DESPESA'
            AND cartao_id IS NOT NULL AND fatura_id IS NOT NULL
            AND conta_id IS NULL AND data_pagamento IS NULL)
        OR
        (forma_pagamento <> 'CREDITO' AND conta_id IS NOT NULL AND fatura_id IS NULL)
    ),
    CHECK ((parcela_numero IS NULL AND parcela_total IS NULL AND grupo_parcela_id IS NULL)
        OR (parcela_numero BETWEEN 1 AND parcela_total AND grupo_parcela_id IS NOT NULL))
);

CREATE INDEX ix_lanc_usuario_venc   ON lancamentos (usuario_id, data_vencimento);
CREATE INDEX ix_lanc_usuario_lanc   ON lancamentos (usuario_id, data_lancamento);
CREATE INDEX ix_lanc_fatura         ON lancamentos (fatura_id) WHERE fatura_id IS NOT NULL;
CREATE INDEX ix_lanc_conta          ON lancamentos (conta_id)  WHERE conta_id  IS NOT NULL;
CREATE INDEX ix_lanc_grupo_parcela  ON lancamentos (grupo_parcela_id) WHERE grupo_parcela_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Transferências entre contas (não são despesa nem receita)
-- -----------------------------------------------------------------------------
CREATE TABLE transferencias (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id        uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conta_origem_id   uuid NOT NULL,
    conta_destino_id  uuid NOT NULL,
    valor             numeric(14,2) NOT NULL CHECK (valor > 0),
    data              date NOT NULL DEFAULT current_date,
    observacao        text,
    FOREIGN KEY (usuario_id, conta_origem_id)  REFERENCES contas (usuario_id, id),
    FOREIGN KEY (usuario_id, conta_destino_id) REFERENCES contas (usuario_id, id),
    CHECK (conta_origem_id <> conta_destino_id)
);

-- -----------------------------------------------------------------------------
-- atualizado_em automático
-- -----------------------------------------------------------------------------
CREATE FUNCTION set_atualizado_em() RETURNS trigger AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lancamentos_atualizado
    BEFORE UPDATE ON lancamentos
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- -----------------------------------------------------------------------------
-- Saldo atual de cada conta (só movimentos efetivados)
-- -----------------------------------------------------------------------------
CREATE VIEW v_saldo_contas AS
SELECT c.id AS conta_id,
       c.usuario_id,
       c.nome,
       c.saldo_inicial
         + COALESCE((SELECT sum(CASE l.tipo WHEN 'RECEITA' THEN l.valor ELSE -l.valor END)
                       FROM lancamentos l
                      WHERE l.conta_id = c.id AND l.data_pagamento IS NOT NULL), 0)
         + COALESCE((SELECT sum(t.valor) FROM transferencias t WHERE t.conta_destino_id = c.id), 0)
         - COALESCE((SELECT sum(t.valor) FROM transferencias t WHERE t.conta_origem_id  = c.id), 0)
         - COALESCE((SELECT sum(l.valor)
                       FROM faturas f
                       JOIN lancamentos l ON l.fatura_id = f.id
                      WHERE f.conta_pagamento_id = c.id AND f.status = 'PAGA'), 0)
         AS saldo_atual
  FROM contas c;

-- -----------------------------------------------------------------------------
-- Exemplos de consultas
-- -----------------------------------------------------------------------------
-- Total de cada fatura:
--   SELECT f.id, ca.nome, f.data_vencimento, f.status, sum(l.valor) AS total
--     FROM faturas f
--     JOIN cartoes ca ON ca.id = f.cartao_id
--     LEFT JOIN lancamentos l ON l.fatura_id = f.id
--    WHERE f.usuario_id = :usuario
--    GROUP BY f.id, ca.nome, f.data_vencimento, f.status;
--
-- Despesas do mês por categoria (competência = data da compra):
--   SELECT c.nome, sum(l.valor) AS total
--     FROM lancamentos l
--     LEFT JOIN categorias c ON c.id = l.categoria_id
--    WHERE l.usuario_id = :usuario AND l.tipo = 'DESPESA'
--      AND l.data_lancamento >= date_trunc('month', current_date)
--      AND l.data_lancamento <  date_trunc('month', current_date) + interval '1 month'
--    GROUP BY c.nome ORDER BY total DESC;
