# Configuração do Supabase

## 1. Obter Credenciais do Banco de Dados

### Passo 1: Acessar o Dashboard do Supabase
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `vgzylypzrudzrhueoros`

### Passo 2: Obter Connection Strings
1. No dashboard, vá em **Settings** → **Database**
2. Encontre a seção **Connection string**
3. Copie as duas strings:

**Connection Pooling (para uso geral):**
```
postgresql://postgres.vgzylypzrudzrhueoros:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection (para migrations):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.vgzylypzrudzrhueoros.supabase.co:5432/postgres
```

### Passo 3: Obter a Senha
- A senha foi criada quando você criou o projeto
- Se esqueceu, você pode resetar em **Settings** → **Database** → **Database Password**

## 2. Configurar .env

Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o `.env` e substitua `[YOUR-PASSWORD]` pela senha real:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres.vgzylypzrudzrhueoros:SUA_SENHA_AQUI@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres:SUA_SENHA_AQUI@db.vgzylypzrudzrhueoros.supabase.co:5432/postgres"

SUPABASE_URL="https://vgzylypzrudzrhueoros.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenlseXB6cnVkenJodWVvcm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc2MDYsImV4cCI6MjA4MTQ4MzYwNn0.gbXPQIPMq8PNFwzyiwV-WvWSa4Hlcre7Nz_gmva6qJQ"
```

## 3. Executar Migrations

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Criar usuário admin inicial
npm run seed
```

## 4. Configurar Redis

### Opção 1: Redis Local (Desenvolvimento)
```bash
# Instalar Redis (Ubuntu/Debian)
sudo apt-get install redis-server
sudo systemctl start redis

# Instalar Redis (macOS)
brew install redis
brew services start redis
```

### Opção 2: Upstash Redis (Recomendado para Produção)

1. Acesse: https://upstash.com/
2. Crie uma conta gratuita
3. Crie um Redis database
4. Copie a URL de conexão

No `.env`:
```env
REDIS_URL="redis://default:sua-senha@endpoint.upstash.io:6379"
```

E atualize `backend/src/config/redis.ts` para usar a URL:
```typescript
import Redis from 'ioredis';

export const redisConnection = new Redis(
  process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);
```

## 5. Verificar Conexão

```bash
# Testar conexão com Supabase
npm run dev

# Em outro terminal, testar endpoint
curl http://localhost:3000/health
```

Resposta esperada:
```json
{"status":"ok","timestamp":"2025-12-17T..."}
```

## 6. Visualizar Dados no Supabase

1. No dashboard do Supabase, vá em **Table Editor**
2. Você verá as tabelas criadas pelas migrations:
   - users
   - tickets
   - messages
   - attachments
   - email_configs
   - webhook_configs
   - webhook_logs
   - system_logs

## 7. Troubleshooting

### Erro de conexão
- Verifique se a senha está correta
- Verifique se o IP está permitido (Supabase permite todos por padrão)

### Erro de SSL
Adicione `?sslmode=require` no final da connection string:
```
postgresql://...?pgbouncer=true&sslmode=require
```

### Timeout em migrations
Use a DIRECT_URL em vez da pooled connection para migrations.

## 8. Monitoramento

No dashboard do Supabase:
- **Database** → **Logs**: Ver queries SQL
- **Database** → **Roles**: Ver roles e permissões
- **API** → **Logs**: Ver requests da API

## Notas Importantes

- ✅ Supabase fornece PostgreSQL gerenciado
- ✅ Connection pooling já configurado (PgBouncer)
- ✅ Backups automáticos
- ✅ Painel visual para gerenciar dados
- ⚠️ Plano gratuito tem limites (500MB storage, 2GB bandwidth/mês)
- ⚠️ Para produção, considere upgrade para Pro ($25/mês)
