# 🚀 Guia de Deploy - Sistema de Gestão de Emails

Este guia explica como fazer o deploy do frontend Next.js na Vercel.

## 📋 Pré-requisitos

- Conta GitHub (já tem o repositório)
- Conta Vercel (criar em https://vercel.com)
- Banco de dados Supabase configurado (✅ já feito)

## 🚀 Deploy na Vercel (Recomendado)

### Opção 1: Deploy via Dashboard (Mais Fácil)

#### 1. Acessar Vercel

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**

#### 2. Importar Repositório

1. Selecione o repositório: `tomasbalestrin-brius/gestao-de-emails`
2. Clique em **"Import"**

#### 3. Configurar Projeto

**Root Directory:**
```
frontend
```

**Framework Preset:**
- Selecione: `Next.js`

**Build Settings:**
- Build Command: `npm run build` (auto-detectado)
- Output Directory: `.next` (auto-detectado)
- Install Command: `npm install` (auto-detectado)

#### 4. Configurar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

**Obrigatórias:**
```
NEXT_PUBLIC_SUPABASE_URL = https://vgzylypzrudzrhueoros.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenlseXB6cnVkenJodWVvcm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc2MDYsImV4cCI6MjA4MTQ4MzYwNn0.gbXPQIPMq8PNFwzyiwV-WvWSa4Hlcre7Nz_gmva6qJQ
```

**Opcionais:**
```
NEXT_PUBLIC_APP_NAME = Sistema de Gestão de Emails
NEXT_PUBLIC_API_URL = https://seu-backend.railway.app (se tiver)
```

#### 5. Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. ✅ Pronto! Seu site estará no ar

### Opção 2: Deploy via CLI (Avançado)

Se preferir usar a linha de comando:

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy

```bash
cd frontend
vercel
```

Siga as instruções:
- Set up and deploy? **Y**
- Which scope? *Selecione sua conta*
- Link to existing project? **N**
- Project name? `gestao-de-emails-frontend`
- In which directory? **frontend**
- Override settings? **N**

#### 4. Configurar Variáveis de Ambiente

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Cole: https://vgzylypzrudzrhueoros.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Cole a chave (ver abaixo)
```

**Supabase Anon Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenlseXB6cnVkenJodWVvcm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc2MDYsImV4cCI6MjA4MTQ4MzYwNn0.gbXPQIPMq8PNFwzyiwV-WvWSa4Hlcre7Nz_gmva6qJQ
```

#### 5. Deploy para Produção

```bash
vercel --prod
```

## 🔐 Variáveis de Ambiente Completas

### Desenvolvimento (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://vgzylypzrudzrhueoros.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenlseXB6cnVkenJodWVvcm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc2MDYsImV4cCI6MjA4MTQ4MzYwNn0.gbXPQIPMq8PNFwzyiwV-WvWSa4Hlcre7Nz_gmva6qJQ
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Sistema de Gestão de Emails
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Produção (Vercel Dashboard)
```env
NEXT_PUBLIC_SUPABASE_URL=https://vgzylypzrudzrhueoros.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenlseXB6cnVkenJodWVvcm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc2MDYsImV4cCI6MjA4MTQ4MzYwNn0.gbXPQIPMq8PNFwzyiwV-WvWSa4Hlcre7Nz_gmva6qJQ
NEXT_PUBLIC_APP_NAME=Sistema de Gestão de Emails
```

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

### 1. Site está no ar
```
https://seu-projeto.vercel.app
```

### 2. Teste o Login
- Email: `tomasbalestrin@gmail.com`
- Senha: `12345678`

### 3. Verifique Funcionalidades
- [ ] Dashboard carrega
- [ ] Tickets aparecem (4 tickets de exemplo)
- [ ] Estatísticas mostram números corretos
- [ ] Pode navegar entre páginas
- [ ] Pode fazer logout

## 🔧 Configurações Adicionais

### Domínio Customizado

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio: `emails.seudominio.com.br`
3. Configure DNS conforme instruções da Vercel

### Deploy Automático

Já está configurado! Toda vez que você fizer push para a branch `claude/email-support-system-gzQML`, a Vercel fará deploy automaticamente.

### Preview Deployments

A Vercel cria automaticamente previews para cada Pull Request.

## 🐛 Troubleshooting

### Erro: "Cannot connect to Supabase"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o Supabase Anon Key está sem quebras de linha

### Erro: Build Failed
- Verifique os logs do build
- Confirme que `Root Directory` está como `frontend`
- Teste o build localmente: `npm run build`

### Erro: 404 Not Found
- Verifique se o Output Directory está como `.next`
- Confirme que o Framework é Next.js

### Dados não aparecem
- Verifique se executou o script SQL no Supabase
- Confirme Row Level Security no Supabase
- Veja console do navegador (F12)

## 📊 Monitoramento

### Analytics
A Vercel fornece analytics automáticos:
- Pageviews
- Performance (Web Vitals)
- Erros

### Logs
Acesse os logs em: **Dashboard** > **Deployments** > **[Seu Deploy]** > **Logs**

## 🚀 Deploy do Backend (Opcional)

Se quiser fazer deploy do backend também:

### Railway.app (Recomendado)

1. Acesse https://railway.app
2. Conecte seu GitHub
3. Selecione `gestao-de-emails`
4. Configure Root Directory: `backend`
5. Adicione variáveis de ambiente:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - Etc.

### Render.com

1. Acesse https://render.com
2. New > Web Service
3. Conecte repositório
4. Root Directory: `backend`
5. Build Command: `npm install && npx prisma generate`
6. Start Command: `npm start`

## 📝 Checklist Final

- [ ] Deploy do frontend na Vercel concluído
- [ ] Variáveis de ambiente configuradas
- [ ] Login funcionando
- [ ] Tickets aparecem
- [ ] Dashboard exibe estatísticas
- [ ] Domínio customizado (opcional)
- [ ] Deploy automático ativado

## 🎉 Pronto!

Seu sistema está no ar e funcionando! 🚀

**URL do Deploy:** `https://seu-projeto.vercel.app`

Qualquer dúvida, consulte:
- [Documentação Vercel](https://vercel.com/docs)
- [Next.js Deploy Guide](https://nextjs.org/docs/deployment)
