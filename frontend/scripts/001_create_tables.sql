-- Criação das tabelas para o sistema de gestão de emails

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('admin', 'agente')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  assunto TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta')),
  cliente_email TEXT NOT NULL,
  cliente_nome TEXT,
  atribuido_a BIGINT REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de emails
CREATE TABLE IF NOT EXISTS emails (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  remetente TEXT NOT NULL,
  destinatarios TEXT[] NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  html TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('recebido', 'enviado')),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de anexos
CREATE TABLE IF NOT EXISTS anexos (
  id BIGSERIAL PRIMARY KEY,
  email_id BIGINT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_conteudo TEXT NOT NULL,
  tamanho BIGINT NOT NULL,
  url TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_cliente_email ON tickets(cliente_email);
CREATE INDEX IF NOT EXISTS idx_tickets_atribuido_a ON tickets(atribuido_a);
CREATE INDEX IF NOT EXISTS idx_emails_ticket_id ON emails(ticket_id);
CREATE INDEX IF NOT EXISTS idx_anexos_email_id ON anexos(email_id);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_tickets_atualizado_em
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();
