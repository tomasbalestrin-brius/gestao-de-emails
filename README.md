# Sistema de Gestão de Emails para Suporte

Sistema completo para gerenciamento de tickets de suporte através de emails, com backend em Node.js e frontend em React.

## 🚀 Funcionalidades

### Backend
- ✅ Autenticação JWT com roles (Admin/Agent)
- ✅ Recebimento de emails via Amazon SES
- ✅ Envio de emails via Amazon SES
- ✅ Gestão completa de tickets
- ✅ Threading de conversas por email
- ✅ Upload de anexos para Cloudflare R2
- ✅ Filas com BullMQ + Redis
- ✅ Webhooks externos configuráveis
- ✅ Logs estruturados

### Frontend (em desenvolvimento)
- 🔄 Dashboard de tickets
- 🔄 Visualização de conversas
- 🔄 Editor de resposta
- 🔄 Painel administrativo

## 📋 Stack Tecnológica

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 15+ com Prisma ORM
- **Queue**: BullMQ + Redis
- **Email**: Amazon SES (AWS SDK v3)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: JWT
- **Validation**: Zod

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: TailwindCSS + shadcn/ui
- **State**: TanStack Query (React Query)
- **HTTP**: Axios

## 🛠️ Configuração

### Requisitos
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Conta AWS (para SES)
- Conta Cloudflare (para R2)

### 1. Clonar o repositório

```bash
git clone <repo-url>
cd gestao-de-emails
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Setup do banco de dados
npm run prisma:migrate
npm run prisma:generate
npm run seed

# Iniciar servidor
npm run dev
```

### 3. Configurar Workers (em terminais separados)

```bash
# Terminal 1 - Email Sender
npm run worker:sender

# Terminal 2 - Webhook Dispatcher
npm run worker:webhook

# Terminal 3 - Email Processor (opcional)
npm run worker:email
```

### 4. Configurar Frontend (em desenvolvimento)

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env se necessário

# Iniciar dev server
npm run dev
```

## 🌐 Endpoints da API

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Usuário atual

### Tickets
- `GET /api/tickets` - Listar tickets
- `GET /api/tickets/:id` - Detalhes do ticket
- `GET /api/tickets/stats` - Estatísticas
- `PATCH /api/tickets/:id/status` - Atualizar status
- `PATCH /api/tickets/:id/priority` - Atualizar prioridade
- `POST /api/tickets/:id/tags` - Atualizar tags
- `POST /api/tickets/:id/reply` - Responder ticket

### Webhooks
- `POST /webhooks/inbound-email` - Receber emails (SNS)

## 📧 Configuração de Email (Amazon SES)

### 1. Verificar Domínio
1. Acesse o console AWS SES
2. Verifique seu domínio
3. Configure registros DNS (SPF, DKIM, DMARC)

### 2. Configurar Recebimento
1. Crie um tópico SNS
2. Configure regra no SES:
   - Condition: Recipient = suporte@seudominio.com
   - Action: Publish to SNS Topic
3. Configure subscrição HTTP no SNS:
   - Endpoint: https://seu-dominio.com/webhooks/inbound-email
   - Protocol: HTTPS

### 3. Configurar Envio
1. Obtenha credenciais SMTP ou API
2. Configure no `.env`:
   ```
   AWS_SES_REGION=us-east-1
   AWS_SES_ACCESS_KEY_ID=sua-key
   AWS_SES_SECRET_ACCESS_KEY=sua-secret
   ```

## 💾 Configuração de Storage (Cloudflare R2)

### 1. Criar Bucket
1. Acesse Cloudflare R2
2. Crie um bucket para anexos
3. Configure CORS se necessário

### 2. Obter Credenciais
1. Gere Access Key e Secret Key
2. Configure domínio público (opcional)

### 3. Configurar no `.env`
```
R2_ACCOUNT_ID=seu-account-id
R2_ACCESS_KEY_ID=sua-key
R2_SECRET_ACCESS_KEY=sua-secret
R2_BUCKET_NAME=email-attachments
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- JWT com expiração configurável
- Rate limiting (100 req/min por IP)
- Validação de entrada com Zod
- CORS configurado
- Headers de segurança (Helmet)

## 📊 Monitoramento

### Logs
- Logs estruturados com Pino
- Níveis: DEBUG, INFO, WARN, ERROR
- Salvos no banco de dados

### Filas
- Dashboard BullMQ disponível
- Métricas de jobs processados
- Retry automático com backoff

## 🧪 Teste de Configuração

### Testar SES
```bash
curl -X POST http://localhost:3000/api/admin/config/email/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testar R2
```bash
# Upload de teste será feito automaticamente no primeiro anexo
```

## 📁 Estrutura do Projeto

```
gestao-de-emails/
├── backend/           # Backend Node.js + Fastify
│   ├── src/
│   │   ├── config/   # Configurações
│   │   ├── modules/  # Módulos da aplicação
│   │   ├── workers/  # Workers BullMQ
│   │   ├── services/ # Serviços auxiliares
│   │   └── utils/    # Utilitários
│   └── prisma/       # Schema e migrations
│
└── frontend/         # Frontend React (em desenvolvimento)
    └── src/
        ├── pages/    # Páginas
        ├── components/ # Componentes
        └── hooks/    # Custom hooks
```

## 🚧 Próximos Passos

### Backend
- [ ] Implementar rotas admin completas
- [ ] Adicionar testes unitários
- [ ] Melhorar tratamento de erros
- [ ] Implementar rate limiting por usuário
- [ ] Adicionar métricas e monitoring

### Frontend
- [ ] Completar dashboard de tickets
- [ ] Implementar visualização de conversas
- [ ] Criar editor de resposta com anexos
- [ ] Desenvolver painel administrativo
- [ ] Adicionar notificações em tempo real

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.
