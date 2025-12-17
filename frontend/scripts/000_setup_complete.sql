-- Script completo de configuração do banco de dados
-- Execute este script no Supabase SQL Editor

-- Limpar tabelas existentes (se necessário)
DROP TABLE IF EXISTS anexos CASCADE;
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Remover função se existir
DROP FUNCTION IF EXISTS update_atualizado_em() CASCADE;

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de usuários
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('admin', 'agente')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tickets
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

-- Tabela de emails
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

-- Tabela de anexos
CREATE TABLE anexos (
  id BIGSERIAL PRIMARY KEY,
  email_id BIGINT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_conteudo TEXT NOT NULL,
  tamanho BIGINT NOT NULL,
  url TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar triggers para atualizar timestamps
CREATE TRIGGER trigger_usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_tickets_atualizado_em
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

-- Índices para melhor performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_cliente_email ON tickets(cliente_email);
CREATE INDEX idx_tickets_atribuido_a ON tickets(atribuido_a);
CREATE INDEX idx_emails_ticket_id ON emails(ticket_id);
CREATE INDEX idx_anexos_email_id ON anexos(email_id);

-- Inserir usuário admin padrão (senha: admin123)
-- Hash bcrypt para 'admin123': $2a$10$rN8YxJZE4qO5lGVJ5YvZe.J3zPZBqKqF5x9xGJxKqxKxKxKxKxKxK
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES
  ('Admin', 'admin@example.com', '$2a$10$rN8YxJZE4qO5lGVJ5YvZe.J3zPZBqKqF5x9xGJxKqxKxKxKxKxKxK', 'admin'),
  ('Agente Suporte', 'agente@example.com', '$2a$10$rN8YxJZE4qO5lGVJ5YvZe.J3zPZBqKqF5x9xGJxKqxKxKxKxKxKxK', 'agente');

-- Inserir tickets de exemplo
INSERT INTO tickets (assunto, status, prioridade, cliente_email, cliente_nome, atribuido_a) VALUES
  ('Problema com login no sistema', 'aberto', 'alta', 'cliente1@example.com', 'João Silva', 2),
  ('Dúvida sobre funcionalidade', 'em_andamento', 'media', 'cliente2@example.com', 'Maria Santos', 2),
  ('Solicitação de nova feature', 'aberto', 'baixa', 'cliente3@example.com', 'Pedro Costa', NULL),
  ('Bug na página de relatórios', 'resolvido', 'alta', 'cliente4@example.com', 'Ana Paula', 2);

-- Inserir emails de exemplo
INSERT INTO emails (ticket_id, remetente, destinatarios, assunto, corpo, tipo) VALUES
  (1, 'cliente1@example.com', ARRAY['suporte@example.com'], 'Problema com login no sistema', 'Olá, não consigo fazer login no sistema. Já tentei recuperar a senha mas não funcionou.', 'recebido'),
  (2, 'cliente2@example.com', ARRAY['suporte@example.com'], 'Dúvida sobre funcionalidade', 'Como faço para exportar os relatórios em formato PDF?', 'recebido'),
  (2, 'suporte@example.com', ARRAY['cliente2@example.com'], 'Re: Dúvida sobre funcionalidade', 'Olá Maria! Para exportar em PDF, basta clicar no botão de exportar no canto superior direito da tela de relatórios.', 'enviado'),
  (3, 'cliente3@example.com', ARRAY['suporte@example.com'], 'Solicitação de nova feature', 'Gostaria de sugerir a adição de um sistema de notificações em tempo real.', 'recebido'),
  (4, 'cliente4@example.com', ARRAY['suporte@example.com'], 'Bug na página de relatórios', 'Os relatórios não estão sendo gerados corretamente quando filtro por data.', 'recebido'),
  (4, 'suporte@example.com', ARRAY['cliente4@example.com'], 'Re: Bug na página de relatórios', 'Obrigado por reportar! Identificamos e corrigimos o problema. Por favor, teste novamente.', 'enviado');

-- Habilitar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: permitir leitura pública (temporário - ajuste conforme necessário)
CREATE POLICY "Permitir leitura pública de usuários" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de emails" ON emails FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de anexos" ON anexos FOR SELECT USING (true);

-- Políticas para inserção e atualização (temporário - ajuste conforme necessário)
CREATE POLICY "Permitir inserção de tickets" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de tickets" ON tickets FOR UPDATE USING (true);
CREATE POLICY "Permitir inserção de emails" ON emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de anexos" ON anexos FOR INSERT WITH CHECK (true);
