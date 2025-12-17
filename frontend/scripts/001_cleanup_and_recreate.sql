-- Script de limpeza e recriação completa
-- Execute este script para corrigir problemas de tipos

-- PASSO 1: Desabilitar RLS e remover políticas
DROP POLICY IF EXISTS "Permitir leitura pública de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir leitura pública de tickets" ON tickets;
DROP POLICY IF EXISTS "Permitir leitura pública de emails" ON emails;
DROP POLICY IF EXISTS "Permitir leitura pública de anexos" ON anexos;
DROP POLICY IF EXISTS "Permitir inserção de tickets" ON tickets;
DROP POLICY IF EXISTS "Permitir atualização de tickets" ON tickets;
DROP POLICY IF EXISTS "Permitir inserção de emails" ON emails;
DROP POLICY IF EXISTS "Permitir inserção de anexos" ON anexos;

-- PASSO 2: Remover tabelas em ordem reversa (por causa das FKs)
DROP TABLE IF EXISTS anexos CASCADE;
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- PASSO 3: Remover funções
DROP FUNCTION IF EXISTS update_atualizado_em() CASCADE;

-- PASSO 4: Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 5: Criar tabela de usuários
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('admin', 'agente')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 6: Criar tabela de tickets
CREATE TABLE tickets (
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

-- PASSO 7: Criar tabela de emails (BIGINT ticket_id)
CREATE TABLE emails (
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

-- PASSO 8: Criar tabela de anexos (BIGINT email_id)
CREATE TABLE anexos (
  id BIGSERIAL PRIMARY KEY,
  email_id BIGINT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_conteudo TEXT NOT NULL,
  tamanho BIGINT NOT NULL,
  url TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 9: Criar triggers
CREATE TRIGGER trigger_usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_tickets_atualizado_em
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

-- PASSO 10: Criar índices
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_cliente_email ON tickets(cliente_email);
CREATE INDEX idx_tickets_atribuido_a ON tickets(atribuido_a);
CREATE INDEX idx_emails_ticket_id ON emails(ticket_id);
CREATE INDEX idx_anexos_email_id ON anexos(email_id);

-- PASSO 11: Inserir dados de exemplo
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES
  ('Admin', 'admin@example.com', '$2a$10$rN8YxJZE4qO5lGVJ5YvZe.J3zPZBqKqF5x9xGJxKqxKxKxKxKxKxK', 'admin'),
  ('Agente Suporte', 'agente@example.com', '$2a$10$rN8YxJZE4qO5lGVJ5YvZe.J3zPZBqKqF5x9xGJxKqxKxKxKxKxKxK', 'agente');

INSERT INTO tickets (assunto, status, prioridade, cliente_email, cliente_nome, atribuido_a) VALUES
  ('Problema com login no sistema', 'aberto', 'alta', 'cliente1@example.com', 'João Silva', 2),
  ('Dúvida sobre funcionalidade', 'em_andamento', 'media', 'cliente2@example.com', 'Maria Santos', 2),
  ('Solicitação de nova feature', 'aberto', 'baixa', 'cliente3@example.com', 'Pedro Costa', NULL),
  ('Bug na página de relatórios', 'resolvido', 'alta', 'cliente4@example.com', 'Ana Paula', 2);

INSERT INTO emails (ticket_id, remetente, destinatarios, assunto, corpo, tipo) VALUES
  (1, 'cliente1@example.com', ARRAY['suporte@example.com'], 'Problema com login no sistema', 'Olá, não consigo fazer login no sistema. Já tentei recuperar a senha mas não funcionou.', 'recebido'),
  (2, 'cliente2@example.com', ARRAY['suporte@example.com'], 'Dúvida sobre funcionalidade', 'Como faço para exportar os relatórios em formato PDF?', 'recebido'),
  (2, 'suporte@example.com', ARRAY['cliente2@example.com'], 'Re: Dúvida sobre funcionalidade', 'Olá Maria! Para exportar em PDF, basta clicar no botão de exportar no canto superior direito da tela de relatórios.', 'enviado'),
  (3, 'cliente3@example.com', ARRAY['suporte@example.com'], 'Solicitação de nova feature', 'Gostaria de sugerir a adição de um sistema de notificações em tempo real.', 'recebido'),
  (4, 'cliente4@example.com', ARRAY['suporte@example.com'], 'Bug na página de relatórios', 'Os relatórios não estão sendo gerados corretamente quando filtro por data.', 'recebido'),
  (4, 'suporte@example.com', ARRAY['cliente4@example.com'], 'Re: Bug na página de relatórios', 'Obrigado por reportar! Identificamos e corrigimos o problema. Por favor, teste novamente.', 'enviado');

-- PASSO 12: Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos ENABLE ROW LEVEL SECURITY;

-- PASSO 13: Criar políticas RLS permissivas (para desenvolvimento)
CREATE POLICY "Permitir todas operações em usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em emails" ON emails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em anexos" ON anexos FOR ALL USING (true) WITH CHECK (true);
