-- Execute este script completo de uma vez no Supabase SQL Editor
-- Link: https://vgzylypzrudzrhueoros.supabase.co/project/_/sql

-- Limpar tabelas existentes (se houver)
DROP TABLE IF EXISTS anexos CASCADE;
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Criar tabela usuarios
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('admin', 'agente')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela tickets
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

-- Criar tabela emails
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

-- Criar tabela anexos
CREATE TABLE anexos (
  id BIGSERIAL PRIMARY KEY,
  email_id BIGINT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_conteudo TEXT NOT NULL,
  tamanho BIGINT NOT NULL,
  url TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_cliente_email ON tickets(cliente_email);
CREATE INDEX idx_emails_ticket_id ON emails(ticket_id);
CREATE INDEX idx_anexos_email_id ON anexos(email_id);

-- Inserir usuários de exemplo
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES
  ('Admin Sistema', 'admin@exemplo.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 'admin'),
  ('Agente Suporte', 'agente@exemplo.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 'agente');

-- Inserir tickets de exemplo
INSERT INTO tickets (assunto, status, prioridade, cliente_email, cliente_nome, atribuido_a) VALUES
  ('Problema com login no sistema', 'aberto', 'alta', 'cliente1@exemplo.com', 'João Silva', 2),
  ('Dúvida sobre funcionalidade', 'em_andamento', 'media', 'cliente2@exemplo.com', 'Maria Santos', 2),
  ('Solicitação de nova feature', 'aberto', 'baixa', 'cliente3@exemplo.com', 'Pedro Costa', NULL),
  ('Bug na página de relatórios', 'resolvido', 'alta', 'cliente4@exemplo.com', 'Ana Paula', 2);

-- Inserir emails de exemplo
INSERT INTO emails (ticket_id, remetente, destinatarios, assunto, corpo, tipo) VALUES
  (1, 'cliente1@exemplo.com', ARRAY['suporte@exemplo.com'], 'Problema com login no sistema', 'Olá, não consigo fazer login no sistema. Já tentei recuperar a senha mas não funcionou.', 'recebido'),
  (2, 'cliente2@exemplo.com', ARRAY['suporte@exemplo.com'], 'Dúvida sobre funcionalidade', 'Como faço para exportar os relatórios em formato PDF?', 'recebido'),
  (2, 'suporte@exemplo.com', ARRAY['cliente2@exemplo.com'], 'Re: Dúvida sobre funcionalidade', 'Olá Maria! Para exportar em PDF, basta clicar no botão de exportar no canto superior direito.', 'enviado'),
  (3, 'cliente3@exemplo.com', ARRAY['suporte@exemplo.com'], 'Solicitação de nova feature', 'Gostaria de sugerir a adição de um sistema de notificações em tempo real.', 'recebido'),
  (4, 'cliente4@exemplo.com', ARRAY['suporte@exemplo.com'], 'Bug na página de relatórios', 'Os relatórios não estão sendo gerados quando filtro por data.', 'recebido'),
  (4, 'suporte@exemplo.com', ARRAY['cliente4@exemplo.com'], 'Re: Bug na página de relatórios', 'Identificamos e corrigimos o problema. Por favor, teste novamente.', 'enviado');

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para desenvolvimento
CREATE POLICY "allow_all_usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_emails" ON emails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_anexos" ON anexos FOR ALL USING (true) WITH CHECK (true);
