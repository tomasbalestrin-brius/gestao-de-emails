# 🔌 Conexões Pendentes - Guia Completo

Este documento lista **todas as conexões necessárias** para ter o sistema 100% funcional.

---

## ✅ O Que Já Está Conectado

| Serviço | Status | Detalhes |
|---------|--------|----------|
| **Supabase (Database)** | ✅ Conectado | PostgreSQL configurado e funcionando |
| **Redis (Upstash)** | ✅ Conectado | Cache e filas configurados |
| **Frontend → Supabase** | ✅ Conectado | Auth e queries diretas funcionando |
| **Backend → Database** | ✅ Pronto | Prisma configurado (falta .env) |
| **Backend → Redis** | ✅ Pronto | BullMQ configurado (falta .env) |

---

## ⏳ O Que Falta Conectar

| Serviço | Prioridade | Necessário Para | Impacto |
|---------|-----------|-----------------|---------|
| **1. Backend .env** | 🔴 CRÍTICA | Iniciar backend | Sistema não funciona sem isso |
| **2. AWS SES** | 🟡 MÉDIA | Enviar/receber emails | Funciona sem, mas sem emails |
| **3. Cloudflare R2** | 🟡 MÉDIA | Upload de anexos | Funciona sem, mas sem anexos |
| **4. Frontend → Backend API** | 🟠 ALTA | Usar API ao invés de Supabase direto | Funciona sem, mas limitado |

---

## 🔴 PRIORIDADE 1: Conectar Backend (CRÍTICO)

### O Problema
O backend **não pode iniciar** sem o arquivo `.env` configurado.

### A Solução

#### Passo 1: Criar arquivo .env

```bash
cd backend
cp .env.example .env
```

#### Passo 2: Obter Senha do Supabase

1. Acesse: https://supabase.com/dashboard/project/vgzylypzrudzrhueoros/settings/database
2. Vá em **Database Settings**
3. Copie a **senha do banco** (você definiu ao criar o projeto)
4. Se esqueceu, clique em **Reset Database Password**

#### Passo 3: Obter Credenciais do Redis (Upstash)

1. Acesse: https://console.upstash.com/redis
2. Clique no seu database Redis
3. Copie a **Connection String** que começa com `redis://`

#### Passo 4: Editar .env

Abra `backend/.env` e preencha:

```env
# ===========================
# OBRIGATÓRIAS PARA INICIAR
# ===========================

# Database (substitua [SUA-SENHA] pela senha do Supabase)
DATABASE_URL="postgresql://postgres.vgzylypzrudzrhueoros:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Redis (substitua [SUA-REDIS-URL] pela URL do Upstash)
REDIS_URL="redis://default:[PASSWORD]@enabled-camel-28915.upstash.io:6379"

# JWT (gere uma chave aleatória segura)
JWT_SECRET="mude-para-uma-chave-super-secreta-aleatoria-aqui"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3001

# ===========================
# OPCIONAIS (pode deixar vazio por enquanto)
# ===========================

# AWS SES (deixe vazio por enquanto)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=
AWS_SES_SECRET_ACCESS_KEY=

# Cloudflare R2 (deixe vazio por enquanto)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=email-attachments
```

#### Passo 5: Testar a Conexão

```bash
cd backend

# Instalar dependências (se ainda não fez)
npm install

# Gerar Prisma Client
npx prisma generate

# Iniciar backend
npm run dev
```

**Resultado esperado:**
```
🚀 Servidor rodando em http://0.0.0.0:3000
📊 Health check disponível em http://0.0.0.0:3000/health
🌍 Ambiente: development
```

#### Passo 6: Verificar Conexões

```bash
# Teste o health check
curl http://localhost:3000/health/detailed
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory": { "status": "up" }
  }
}
```

---

## 🟠 PRIORIDADE 2: Conectar Frontend ao Backend

### Atualmente
O frontend se conecta **diretamente ao Supabase**. Funciona, mas não usa a API do backend.

### Para Conectar ao Backend

#### Passo 1: Criar .env.local no Frontend

```bash
cd frontend
cp .env.example .env.local
```

#### Passo 2: Editar .env.local

```env
# Supabase (mantém)
NEXT_PUBLIC_SUPABASE_URL=https://vgzylypzrudzrhueoros.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenlseXB6cnVkenJodWVvcm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc2MDYsImV4cCI6MjA4MTQ4MzYwNn0.gbXPQIPMq8PNFwzyiwV-WvWSa4Hlcre7Nz_gmva6qJQ

# Backend API (adiciona)
NEXT_PUBLIC_API_URL=http://localhost:3000

# App Config
NEXT_PUBLIC_APP_NAME=Sistema de Gestão de Emails
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### Passo 3: Iniciar Frontend

```bash
cd frontend
npm install
npm run dev
```

**Resultado esperado:**
```
▲ Next.js 16.0.10
- Local:        http://localhost:3001
```

#### Passo 4: Testar Conexão

1. Abra http://localhost:3001
2. Faça login com: `tomasbalestrin@gmail.com` / `12345678`
3. Verifique se carrega o dashboard

### Estado Atual vs. Com Backend

| Funcionalidade | Sem Backend API | Com Backend API |
|----------------|-----------------|-----------------|
| Login/Auth | ✅ Supabase direto | ✅ Backend JWT |
| Listar tickets | ✅ Supabase direto | ✅ Backend + filtros avançados |
| Criar tickets | ✅ Supabase direto | ✅ Backend + validações |
| Enviar emails | ❌ Não funciona | ✅ Via SES + Workers |
| Upload anexos | ❌ Não funciona | ✅ Via R2 |
| Webhooks | ❌ Não funciona | ✅ Workers BullMQ |

---

## 🟡 PRIORIDADE 3: Conectar AWS SES (Emails)

### Para Que Serve
- **Enviar emails** de resposta aos clientes
- **Receber emails** e criar tickets automaticamente
- **Notificações** por email

### Como Configurar

#### Passo 1: Criar Conta AWS

1. Acesse: https://aws.amazon.com/
2. Crie uma conta (ou use existente)
3. **Cartão de crédito necessário**, mas SES tem free tier

#### Passo 2: Configurar AWS SES

1. Acesse: https://console.aws.amazon.com/ses/
2. Escolha região: **us-east-1** (recomendado)
3. Clique em **Get Started**

#### Passo 3: Verificar Email

**Para teste (Sandbox Mode):**
1. Vá em **Verified Identities**
2. Clique em **Create Identity**
3. Escolha **Email address**
4. Digite seu email: `tomasbalestrin@gmail.com`
5. Clique em **Create Identity**
6. Verifique o email que receberá

**Para produção (sair do Sandbox):**
1. Vá em **Account dashboard**
2. Clique em **Request production access**
3. Preencha o formulário (justificativa de uso)
4. Aguarde aprovação (1-2 dias úteis)

#### Passo 4: Criar IAM User

1. Acesse: https://console.aws.amazon.com/iam/
2. Vá em **Users** → **Add users**
3. Nome: `email-system-ses`
4. Access type: **Programmatic access**
5. Permissions: **AmazonSESFullAccess**
6. Clique em **Create user**
7. **COPIE e SALVE:**
   - Access Key ID
   - Secret Access Key
   (você não poderá ver novamente!)

#### Passo 5: Adicionar no .env

```env
# No backend/.env
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SES_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
EMAIL_FROM=tomasbalestrin@gmail.com
EMAIL_FROM_NAME="Suporte"
```

#### Passo 6: Testar

```bash
# Reinicie o backend
cd backend
npm run dev

# Em outro terminal, teste enviar email
curl -X POST http://localhost:3000/api/tickets/TICKET_ID/reply \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Teste de email"}'
```

### Custos SES

| Operação | Custo | Free Tier |
|----------|-------|-----------|
| Enviar email | $0.10 / 1.000 emails | 62.000/mês (primeiro ano) |
| Receber email | $0.09 / 1.000 emails | Não tem free tier |

---

## 🟡 PRIORIDADE 4: Conectar Cloudflare R2 (Anexos)

### Para Que Serve
- **Upload de anexos** em tickets
- **Armazenamento de imagens**
- **Storage de arquivos** (alternativa ao S3)

### Como Configurar

#### Passo 1: Criar Conta Cloudflare

1. Acesse: https://dash.cloudflare.com/
2. Crie uma conta (grátis)

#### Passo 2: Ativar R2

1. No dashboard, vá em **R2**
2. Clique em **Purchase R2**
3. É **GRÁTIS até 10GB/mês**

#### Passo 3: Criar Bucket

1. Clique em **Create bucket**
2. Nome: `email-attachments`
3. Região: **Automatic**
4. Clique em **Create bucket**

#### Passo 4: Gerar API Token

1. Vá em **R2** → **Manage R2 API Tokens**
2. Clique em **Create API token**
3. Permissões: **Object Read & Write**
4. **COPIE e SALVE:**
   - Access Key ID
   - Secret Access Key
   - Account ID (no topo da página)

#### Passo 5: Configurar Acesso Público (Opcional)

1. Vá no bucket `email-attachments`
2. Clique em **Settings**
3. Em **Public Access**, clique em **Connect Domain**
4. Ou use **R2.dev subdomain** (grátis)

#### Passo 6: Adicionar no .env

```env
# No backend/.env
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=abcdef1234567890
R2_SECRET_ACCESS_KEY=1234567890abcdef1234567890
R2_BUCKET_NAME=email-attachments
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

#### Passo 7: Testar

```bash
# Reinicie o backend
cd backend
npm run dev

# Teste upload de arquivo via API
# (use Postman ou curl com multipart/form-data)
```

### Custos R2

| Operação | Custo | Free Tier |
|----------|-------|-----------|
| Storage | $0.015 / GB/mês | 10 GB/mês |
| Operações Class A | $4.50 / milhão | Sem limite |
| Operações Class B | $0.36 / milhão | Sem limite |
| Egress (saída) | **$0.00** | Ilimitado! |

**R2 é mais barato que S3!** Sem cobrança de saída de dados.

---

## 🎯 Checklist de Conexões

### Fase 1: Básico (Mínimo para funcionar)
- [ ] Criar `backend/.env` com credenciais do Supabase
- [ ] Criar `backend/.env` com credenciais do Redis
- [ ] Criar `backend/.env` com JWT_SECRET
- [ ] Iniciar backend: `npm run dev`
- [ ] Testar health check: `curl localhost:3000/health/detailed`
- [ ] Criar `frontend/.env.local`
- [ ] Iniciar frontend: `npm run dev`
- [ ] Fazer login no sistema

### Fase 2: Funcionalidades Básicas
- [ ] Criar tickets pelo frontend
- [ ] Visualizar tickets
- [ ] Responder tickets (sem enviar email)
- [ ] Visualizar dashboard

### Fase 3: Emails (Opcional mas Recomendado)
- [ ] Criar conta AWS
- [ ] Configurar SES
- [ ] Verificar email de envio
- [ ] Criar IAM user com SES permissions
- [ ] Adicionar credenciais no `.env`
- [ ] Testar envio de email

### Fase 4: Anexos (Opcional)
- [ ] Criar conta Cloudflare
- [ ] Ativar R2
- [ ] Criar bucket
- [ ] Gerar API token
- [ ] Adicionar credenciais no `.env`
- [ ] Testar upload de arquivo

### Fase 5: Produção (Deploy)
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Configurar variáveis de ambiente em produção
- [ ] Testar sistema em produção
- [ ] Configurar domínio customizado

---

## 🚀 Quick Start (Desenvolvimento Local)

### Opção A: Mínimo Funcional (5 minutos)

```bash
# 1. Backend
cd backend
cp .env.example .env
# Edite .env com credenciais do Supabase e Redis
npm install
npx prisma generate
npm run dev

# 2. Frontend (outro terminal)
cd frontend
cp .env.example .env.local
# .env.local já vem configurado
npm install
npm run dev

# 3. Acesse
# http://localhost:3001
# Login: tomasbalestrin@gmail.com / 12345678
```

### Opção B: Com Docker (2 minutos)

```bash
# 1. Configure variáveis
cp .env.example .env
# Edite .env com suas credenciais

# 2. Inicie tudo
docker-compose up -d

# 3. Acesse
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Redis UI: http://localhost:8081
```

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

#### "Cannot connect to database"
→ Verifique `DATABASE_URL` no `.env`
→ Teste: `npx prisma db pull`

#### "Redis connection failed"
→ Verifique `REDIS_URL` no `.env`
→ Teste: `redis-cli -u $REDIS_URL ping`

#### "Frontend não carrega dados"
→ Backend está rodando? `curl localhost:3000/health`
→ CORS configurado? Verifique `FRONTEND_URL` no backend

#### "Email não envia"
→ SES configurado? Verifique credenciais
→ Email verificado no SES?
→ Saiu do Sandbox mode?

---

## 📊 Resumo de Credenciais Necessárias

| Serviço | Onde Obter | Tempo | Necessário? |
|---------|-----------|-------|-------------|
| **Supabase Password** | Dashboard Supabase | 1 min | ✅ SIM |
| **Redis URL** | Console Upstash | 1 min | ✅ SIM |
| **JWT Secret** | Gere aleatória | 10 seg | ✅ SIM |
| **AWS SES Keys** | IAM Console | 10 min | ⚠️ Para emails |
| **R2 Keys** | Cloudflare Dashboard | 5 min | ⚠️ Para anexos |

---

## 🎉 Próximos Passos

Depois de conectar tudo:

1. **Testar funcionalidades** localmente
2. **Adicionar dados de teste** via seed
3. **Configurar CI/CD** (GitHub Actions)
4. **Fazer deploy** em produção
5. **Configurar monitoramento** (Sentry, logs)

---

**Última atualização:** 2025-12-19

**Dúvidas?** Consulte:
- [Documentação da API](./backend/API.md)
- [Guia de Desenvolvimento](./DEVELOPMENT.md)
- [README Principal](./README.md)
