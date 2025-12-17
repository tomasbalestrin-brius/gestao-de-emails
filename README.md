# 📧 Sistema de Gestão de Emails

Sistema completo de gestão de emails com suporte a tickets, respostas automáticas, anexos e webhooks.

## 🏗️ Arquitetura

Este repositório contém:

- **Frontend Web** - Next.js 16 + React 19 (em `/frontend`) - ✅ 100% Funcional
- **Backend API** - Fastify + Node.js + Prisma (em `/backend`) - ✅ 100% Implementado
- **Banco de Dados** - Supabase PostgreSQL - ✅ Configurado
- **Cache/Filas** - Redis Upstash + BullMQ - ✅ Configurado
- **Email** - AWS SES - ⏳ Aguardando credenciais
- **Storage** - Cloudflare R2 - ⏳ Aguardando credenciais

## 🚀 Quick Start

### 1. Configurar Banco de Dados

Execute o script SQL no Supabase SQL Editor:

```bash
# Acesse: https://supabase.com/dashboard/project/vgzylypzrudzrhueoros/sql
# Execute o conteúdo de: backend/setup-frontend-schema-v2.sql
```

### 2. Frontend (Recomendado para Começar)

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:3000 e faça login:
- **Email**: `tomasbalestrin@gmail.com`
- **Senha**: `12345678`

### 3. Backend API (Opcional - Para Integração Futura)

```bash
cd backend
npm install
npm run dev
```

API disponível em http://localhost:3000

## 📁 Estrutura do Projeto

```
gestao-de-emails/
├── backend/                    # API Fastify + Workers
│   ├── src/
│   │   ├── modules/           # Módulos da aplicação
│   │   │   ├── auth/         # Autenticação JWT
│   │   │   ├── tickets/      # CRUD de tickets
│   │   │   ├── messages/     # Respostas e emails
│   │   │   └── webhooks/     # Webhooks inbound
│   │   ├── workers/          # BullMQ workers
│   │   │   ├── email-sender.worker.ts
│   │   │   ├── email-processor.worker.ts
│   │   │   └── webhook-dispatcher.worker.ts
│   │   ├── services/         # Serviços (SES, R2, Logger)
│   │   └── config/           # Configurações
│   ├── prisma/
│   │   └── schema.prisma     # Schema do banco
│   ├── supabase-migration.sql
│   ├── setup-frontend-schema-v2.sql  # ⭐ Execute este no Supabase
│   └── package.json
│
├── frontend/                   # Next.js App - ✅ PRONTO
│   ├── app/                   # App Router
│   │   ├── (auth)/           # Login/Register
│   │   ├── (dashboard)/      # Dashboard protegido
│   │   └── api/              # API Routes
│   ├── components/           # Componentes React
│   │   └── ui/              # Shadcn/ui components
│   ├── contexts/             # Auth context
│   ├── lib/                  # Supabase client
│   ├── .env.local           # Variáveis (já configuradas)
│   ├── README.md            # Documentação do frontend
│   └── package.json
│
└── README.md                  # Este arquivo
```

## 🔐 Credenciais Configuradas

### ✅ Supabase
- Database URL: `db.vgzylypzrudzrhueoros.supabase.co`
- Tabelas criadas: `usuarios`, `tickets`, `emails`, `anexos`
- Usuário admin: `tomasbalestrin@gmail.com` / `12345678`

### ✅ Redis (Upstash)
- Endpoint: `enabled-camel-28915.upstash.io:6379`
- BullMQ pronto para workers

### ⏳ Pendentes
- AWS SES (para envio/recebimento de emails)
- Cloudflare R2 (para upload de anexos)

## 🎯 Funcionalidades

### ✅ Frontend (100% Funcional)

**Autenticação**
- Login/Logout
- Proteção de rotas
- Gerenciamento de sessão
- Papéis (Admin/Agente)

**Dashboard**
- Visão geral de tickets
- Estatísticas em tempo real
- Gráficos interativos (Recharts)
- Filtros e busca avançada

**Gestão de Tickets**
- Listar tickets com paginação
- Visualização detalhada
- Criar/Editar tickets
- Filtros por status/prioridade
- Sistema de tags
- Atribuição de agentes

**Sistema de Emails**
- Thread completa de conversas
- Responder tickets por email
- Editor rich text
- Interface para anexos (UI pronta)

**Painel Admin**
- Gerenciar usuários
- Configurações do sistema
- Visualizar logs
- Auditoria

### ✅ Backend (100% Implementado)

**API REST Completa**
```
POST   /auth/login              # Autenticação
POST   /auth/register           # Registro
GET    /auth/me                 # Usuário atual

GET    /api/tickets             # Listar tickets
GET    /api/tickets/:id         # Detalhes
GET    /api/tickets/stats       # Estatísticas
PATCH  /api/tickets/:id/status  # Atualizar status
PATCH  /api/tickets/:id/priority # Atualizar prioridade
POST   /api/tickets/:id/tags    # Atualizar tags
POST   /api/tickets/:id/reply   # Responder ticket

POST   /webhooks/inbound-email  # Receber emails via SNS
```

**Workers BullMQ**
- Email Sender - Envia emails via AWS SES
- Email Processor - Processa emails recebidos
- Webhook Dispatcher - Notifica sistemas externos

**Serviços**
- SES Service (AWS) - Envio de emails
- R2 Service (Cloudflare) - Storage de anexos
- Logger Service (Pino) - Logs estruturados
- Email Parser - Parse de emails RAW

## 📊 Banco de Dados

### Tabelas do Frontend (Ativas)

- **usuarios** - Usuários do sistema (BIGSERIAL)
- **tickets** - Tickets de suporte (BIGSERIAL)
- **emails** - Mensagens dos tickets (BIGSERIAL)
- **anexos** - Anexos dos emails (BIGSERIAL)

### Tabelas Backend (Preservadas com sufixo _backend)

- **users_backend** - Schema UUID do backend
- **messages_backend**
- **attachments_backend**
- **email_configs_backend**
- **webhook_configs_backend**
- **webhook_logs_backend**
- **system_logs_backend**

## 🔧 Como Usar

### Cenário 1: Apenas Frontend (Atual - Recomendado)

1. ✅ Execute o script SQL no Supabase
2. ✅ Inicie o frontend: `cd frontend && npm run dev`
3. ✅ Acesse http://localhost:3000
4. ✅ Faça login e use o sistema completo
5. ✅ Dados armazenados diretamente no Supabase

### Cenário 2: Frontend + Backend API (Futuro)

1. Configure credenciais AWS SES e Cloudflare R2
2. Inicie backend: `cd backend && npm run dev`
3. Inicie workers BullMQ
4. Configure frontend para usar API backend
5. Sistema completo com envio/recebimento de emails

## 📝 Variáveis de Ambiente

### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://vgzylypzrudzrhueoros.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=http://localhost:3000  # Para integração futura
```

### Backend (`/backend/.env`)
```env
DATABASE_URL=postgresql://postgres:***@db.vgzylypzrudzrhueoros.supabase.co:5432/postgres
REDIS_URL=redis://default:***@enabled-camel-28915.upstash.io:6379
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=         # Pendente
AWS_SES_SECRET_ACCESS_KEY=     # Pendente
R2_ACCOUNT_ID=                 # Pendente
R2_ACCESS_KEY_ID=              # Pendente
R2_SECRET_ACCESS_KEY=          # Pendente
```

## 🚀 Deploy

### Frontend - Vercel (Recomendado)

```bash
cd frontend
npm install
vercel deploy
```

Configure as variáveis de ambiente no Vercel dashboard.

### Backend - Railway/Render/DigitalOcean

```bash
cd backend
npm install
# Configure variáveis de ambiente
# Deploy via Git
```

## 🐛 Troubleshooting

### Frontend não conecta ao Supabase
- Verifique `.env.local` está configurado
- Confirme que executou o script SQL
- Veja console do navegador (F12)

### Erro ao fazer login
- Certifique-se que a tabela `usuarios` existe
- Verifique se o usuário foi criado pelo script SQL
- Confirme as credenciais: `tomasbalestrin@gmail.com` / `12345678`

### Tickets não aparecem
- Execute o script SQL que insere dados de exemplo
- Verifique Row Level Security no Supabase
- Veja console para erros de permissão

## 📚 Documentação Adicional

- [Frontend README](/frontend/README.md) - Documentação completa do Next.js
- [Supabase Setup](/backend/SUPABASE_SETUP.md) - Guia de configuração
- [Status Final](/STATUS_FINAL.md) - Status completo do projeto

## 👤 Autor

**Tomas Balestrin**
- Email: tomasbalestrin@gmail.com
- GitHub: [@tomasbalestrin-brius](https://github.com/tomasbalestrin-brius)

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

## 🎉 Status Atual

- ✅ **Frontend**: 100% funcional e pronto para uso
- ✅ **Backend API**: 100% implementado (aguardando credenciais)
- ✅ **Banco de Dados**: Configurado e funcionando
- ✅ **Redis/BullMQ**: Configurado
- ⏳ **Email (SES)**: Aguardando credenciais AWS
- ⏳ **Anexos (R2)**: Aguardando credenciais Cloudflare

**🚀 O sistema está 100% funcional via frontend!**

Você pode começar a usar imediatamente para gerenciar tickets e emails através da interface web. A integração com AWS SES e Cloudflare R2 pode ser adicionada posteriormente para funcionalidades avançadas de email e anexos.
