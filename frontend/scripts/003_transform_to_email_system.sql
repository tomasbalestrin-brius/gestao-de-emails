-- Transformação para Sistema de Gestão de Emails
-- Execute este script após o 002_create_tables_simple.sql

-- PASSO 1: Adicionar novas colunas na tabela emails
ALTER TABLE emails ADD COLUMN IF NOT EXISTS pasta TEXT NOT NULL DEFAULT 'inbox' CHECK (pasta IN ('inbox', 'sent', 'drafts', 'trash', 'spam', 'archived'));
ALTER TABLE emails ADD COLUMN IF NOT EXISTS lido BOOLEAN DEFAULT false;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS importante BOOLEAN DEFAULT false;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS thread_id BIGINT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS em_resposta_a BIGINT REFERENCES emails(id);
ALTER TABLE emails ADD COLUMN IF NOT EXISTS cc TEXT[];
ALTER TABLE emails ADD COLUMN IF NOT EXISTS bcc TEXT[];

-- PASSO 2: Criar tabela de rascunhos
CREATE TABLE IF NOT EXISTS rascunhos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  para TEXT[] NOT NULL,
  cc TEXT[],
  bcc TEXT[],
  assunto TEXT,
  corpo TEXT,
  html TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 3: Criar tabela de configurações de email
CREATE TABLE IF NOT EXISTS configuracoes_email (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  email_principal TEXT NOT NULL,
  nome_exibicao TEXT,
  assinatura TEXT,
  ses_configurado BOOLEAN DEFAULT false,
  ses_identity_arn TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 4: Criar índices adicionais
CREATE INDEX IF NOT EXISTS idx_emails_pasta ON emails(pasta);
CREATE INDEX IF NOT EXISTS idx_emails_lido ON emails(lido);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_em_resposta_a ON emails(em_resposta_a);
CREATE INDEX IF NOT EXISTS idx_rascunhos_usuario_id ON rascunhos(usuario_id);

-- PASSO 5: Atualizar emails existentes
UPDATE emails SET pasta = 'inbox' WHERE tipo = 'recebido' AND pasta IS NULL;
UPDATE emails SET pasta = 'sent' WHERE tipo = 'enviado' AND pasta IS NULL;
UPDATE emails SET thread_id = ticket_id WHERE thread_id IS NULL;

-- PASSO 6: Inserir dados de exemplo adicionais
INSERT INTO emails (ticket_id, remetente, destinatarios, assunto, corpo, tipo, pasta, lido, thread_id) VALUES
  (1, 'contato@empresa.com', ARRAY['suporte@example.com'], 'Proposta comercial', 'Gostaria de conhecer mais sobre seus serviços.', 'recebido', 'inbox', false, 5),
  (2, 'newsletter@tech.com', ARRAY['suporte@example.com'], 'Novidades da semana em tecnologia', 'Confira as últimas notícias do mundo tech!', 'recebido', 'inbox', false, 6),
  (3, 'suporte@example.com', ARRAY['parceiro@empresa.com'], 'Reunião agendada', 'Confirmo nossa reunião para sexta-feira às 14h.', 'enviado', 'sent', true, 7);

-- PASSO 7: Inserir configurações de email para usuários existentes
INSERT INTO configuracoes_email (usuario_id, email_principal, nome_exibicao, assinatura) 
SELECT id, email, nome, 'Atenciosamente,<br>' || nome || '<br>Equipe de Suporte'
FROM usuarios
ON CONFLICT (usuario_id) DO NOTHING;

-- PASSO 8: Habilitar RLS nas novas tabelas
ALTER TABLE rascunhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_email ENABLE ROW LEVEL SECURITY;

-- PASSO 9: Criar políticas RLS permissivas
CREATE POLICY "Permitir todas operações em rascunhos" ON rascunhos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações em configuracoes_email" ON configuracoes_email FOR ALL USING (true) WITH CHECK (true);
