# Email Support System - Backend

Sistema de gestão de emails para suporte ao cliente - Backend em Node.js + Fastify + PostgreSQL

## Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 15+ com Prisma ORM
- **Queue**: BullMQ + Redis
- **Email**: AWS SDK v3 (SES)
- **Storage**: AWS SDK v3 (S3 para Cloudflare R2)
- **Auth**: JWT
- **Validation**: Zod

## Configuração Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais.

### 3. Setup do banco de dados

```bash
# Criar o banco de dados PostgreSQL
createdb email_system

# Rodar migrations
npm run prisma:migrate

# Gerar Prisma Client
npm run prisma:generate

# Rodar seed (criar usuário admin)
npm run seed
```

### 4. Iniciar o servidor

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3000`

## Rotas Disponíveis

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro (apenas para setup inicial)
- `GET /auth/me` - Dados do usuário autenticado

### Tickets
- `GET /api/tickets` - Listar tickets (com filtros e paginação)
- `GET /api/tickets/:id` - Buscar ticket por ID
- `GET /api/tickets/stats` - Estatísticas dos tickets
- `PATCH /api/tickets/:id/status` - Atualizar status
- `PATCH /api/tickets/:id/priority` - Atualizar prioridade
- `POST /api/tickets/:id/tags` - Atualizar tags
- `POST /api/tickets/:id/reply` - Responder ticket

### Webhooks
- `POST /webhooks/inbound-email` - Receber emails via SNS/SES
- `GET /webhooks/health` - Health check

### Health
- `GET /health` - Health check geral

## Scripts Disponíveis

```bash
npm run dev           # Desenvolvimento com hot reload
npm run build         # Build para produção
npm start             # Executar produção
npm run prisma:migrate # Rodar migrations
npm run prisma:generate # Gerar Prisma Client
npm run prisma:studio # Abrir Prisma Studio
npm run seed          # Rodar seed (criar admin)
```

## Workers (a implementar)

Os workers devem ser executados separadamente:

```bash
npm run worker:email    # Processar emails recebidos
npm run worker:sender   # Enviar emails
npm run worker:webhook  # Disparar webhooks externos
```

## Estrutura de Pastas

```
src/
├── config/           # Configurações (database, redis, ses, r2, jwt)
├── modules/          # Módulos da aplicação
│   ├── auth/        # Autenticação
│   ├── tickets/     # Tickets
│   ├── messages/    # Mensagens
│   ├── webhooks/    # Webhooks
│   └── admin/       # Admin (a implementar)
├── workers/         # Workers BullMQ (a implementar)
├── services/        # Serviços auxiliares (SES, R2, logger)
├── utils/           # Utilitários (parsers, validators)
├── types/           # Tipos TypeScript
├── middleware/      # Middlewares (auth, errors, cors)
├── app.ts           # Configuração do Fastify
└── server.ts        # Entry point
```

## Configuração Amazon SES

1. Verificar domínio no SES
2. Configurar regra de recebimento:
   - Email → SNS → HTTP Endpoint
   - HTTP Endpoint: `https://seu-dominio.com/webhooks/inbound-email`
3. Configurar credenciais de envio no `.env`

## Configuração Cloudflare R2

1. Criar bucket no R2
2. Configurar CORS se necessário
3. Obter credenciais (Access Key ID e Secret Access Key)
4. Configurar URL pública do bucket
5. Adicionar credenciais no `.env`

## Próximos Passos

- [ ] Implementar rotas admin completas
- [ ] Implementar workers BullMQ
- [ ] Adicionar testes
- [ ] Melhorar tratamento de erros
- [ ] Adicionar rate limiting por usuário
- [ ] Implementar logging estruturado
- [ ] Adicionar métricas e monitoring
