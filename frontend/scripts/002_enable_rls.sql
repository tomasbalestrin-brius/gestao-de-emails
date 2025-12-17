-- Habilitar Row Level Security (RLS) nas tabelas

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (apenas admins podem ver todos, agentes veem a si mesmos)
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid()::text = id::text OR 
         EXISTS (SELECT 1 FROM usuarios WHERE id::text = auth.uid()::text AND papel = 'admin'));

CREATE POLICY "Admins podem atualizar usuários"
  ON usuarios FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id::text = auth.uid()::text AND papel = 'admin'));

CREATE POLICY "Admins podem inserir usuários"
  ON usuarios FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id::text = auth.uid()::text AND papel = 'admin'));

-- Políticas para tickets (todos usuários autenticados podem ver todos os tickets)
CREATE POLICY "Usuários autenticados podem ver tickets"
  ON tickets FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar tickets"
  ON tickets FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Políticas para emails (vinculados aos tickets)
CREATE POLICY "Usuários autenticados podem ver emails"
  ON emails FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar emails"
  ON emails FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para anexos (vinculados aos emails)
CREATE POLICY "Usuários autenticados podem ver anexos"
  ON anexos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar anexos"
  ON anexos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
