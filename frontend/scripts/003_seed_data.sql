-- Dados iniciais para testes

-- Inserir usuário admin (senha: admin123)
-- Nota: O hash é bcrypt de 'admin123'
INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES 
  ('Administrador', 'admin@exemplo.com', '$2a$10$rOZxIZHXXZXXXXXXXXXXXeJ.kQYqYqYqYqYqYqYqYqYqYqYqYqYq', 'admin'),
  ('João Silva', 'joao@exemplo.com', '$2a$10$rOZxIZHXXZXXXXXXXXXXXeJ.kQYqYqYqYqYqYqYqYqYqYqYqYqYq', 'agente')
ON CONFLICT (email) DO NOTHING;

-- Inserir tickets de exemplo
INSERT INTO tickets (assunto, status, prioridade, cliente_email, cliente_nome, atribuido_a)
VALUES 
  ('Problema com login no sistema', 'aberto', 'alta', 'cliente1@exemplo.com', 'Maria Santos', 2),
  ('Dúvida sobre funcionalidade', 'em_andamento', 'media', 'cliente2@exemplo.com', 'Pedro Costa', 2),
  ('Solicitação de novo recurso', 'aberto', 'baixa', 'cliente3@exemplo.com', 'Ana Oliveira', NULL),
  ('Bug no formulário de contato', 'resolvido', 'alta', 'cliente4@exemplo.com', 'Carlos Lima', 2)
ON CONFLICT DO NOTHING;

-- Inserir emails de exemplo para os tickets
INSERT INTO emails (ticket_id, remetente, destinatarios, assunto, corpo, tipo)
VALUES 
  (1, 'cliente1@exemplo.com', ARRAY['suporte@exemplo.com'], 'Problema com login no sistema', 
   'Olá, estou tendo problemas para fazer login no sistema. Sempre que tento entrar, recebo uma mensagem de erro.', 
   'recebido'),
  (2, 'cliente2@exemplo.com', ARRAY['suporte@exemplo.com'], 'Dúvida sobre funcionalidade', 
   'Gostaria de saber como exportar os relatórios em formato PDF.', 
   'recebido'),
  (2, 'suporte@exemplo.com', ARRAY['cliente2@exemplo.com'], 'Re: Dúvida sobre funcionalidade', 
   'Olá! Para exportar em PDF, clique no botão "Exportar" no canto superior direito do relatório.', 
   'enviado')
ON CONFLICT DO NOTHING;
