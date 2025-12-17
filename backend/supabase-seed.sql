-- Seed: Criar usuário admin inicial
-- Execute APÓS executar o supabase-migration.sql

-- Inserir usuário admin
-- Senha: ChangeMeOnFirstLogin123!
-- Hash gerado com bcrypt (10 rounds)
INSERT INTO "users" (
    "id",
    "email",
    "password_hash",
    "name",
    "role",
    "is_active",
    "created_at",
    "updated_at"
) VALUES (
    gen_random_uuid()::text,
    'admin@seudominio.com.br',
    '$2b$10$YourHashWillGoHere',
    'Administrador',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- NOTA: O hash acima é um placeholder
-- Execute o servidor e use o endpoint /auth/register para criar o admin
-- Ou gere o hash usando: node -e "console.log(require('bcrypt').hashSync('ChangeMeOnFirstLogin123!', 10))"
