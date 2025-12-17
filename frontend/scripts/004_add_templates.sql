-- Adicionar tabela de templates de email

CREATE TABLE IF NOT EXISTS email_templates (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  assunto TEXT NOT NULL,
  corpo TEXT NOT NULL,
  html TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_email_templates_usuario_id ON email_templates(usuario_id);

-- Habilitar RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Criar política RLS permissiva
CREATE POLICY "Permitir todas operações em email_templates" ON email_templates FOR ALL USING (true) WITH CHECK (true);

-- Inserir templates de exemplo
INSERT INTO email_templates (usuario_id, nome, assunto, corpo) VALUES
  (1, 'Boas-vindas', 'Bem-vindo!', 'Olá,\n\nSeja bem-vindo ao nosso sistema!\n\nEstamos felizes em tê-lo conosco.\n\nAtenciosamente,\nEquipe de Suporte'),
  (1, 'Resposta padrão', 'Re: Sua solicitação', 'Olá,\n\nObrigado por entrar em contato.\n\nRecebemos sua mensagem e retornaremos em breve.\n\nAtenciosamente,\nEquipe de Suporte'),
  (1, 'Ticket resolvido', 'Ticket resolvido', 'Olá,\n\nSeu ticket foi resolvido com sucesso.\n\nSe precisar de mais ajuda, não hesite em nos contatar novamente.\n\nAtenciosamente,\nEquipe de Suporte'),
  (2, 'Follow-up', 'Acompanhamento', 'Olá,\n\nEntramos em contato para verificar se sua solicitação foi atendida satisfatoriamente.\n\nFicamos à disposição para qualquer dúvida.\n\nAtenciosamente,\nEquipe de Suporte');
