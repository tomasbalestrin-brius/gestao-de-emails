# 🛠️ Guia de Desenvolvimento - Sistema de Gestão de Emails

Este guia contém todas as informações necessárias para desenvolver e contribuir com o projeto.

## 📋 Pré-requisitos

### Ferramentas Necessárias

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** 10+ (incluído com Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Docker** (opcional, mas recomendado) ([Download](https://www.docker.com/))
- **VS Code** (recomendado) ([Download](https://code.visualstudio.com/))

### Contas e Credenciais

- Conta **Supabase** (banco de dados) - [supabase.com](https://supabase.com)
- Conta **Upstash** (Redis) - [upstash.com](https://upstash.com)
- Conta **AWS** (SES para emails) - [aws.amazon.com](https://aws.amazon.com)
- Conta **Cloudflare** (R2 para anexos) - [cloudflare.com](https://cloudflare.com)

---

## 🚀 Setup Inicial

### 1. Clonar o Repositório

```bash
git clone https://github.com/tomasbalestrin-brius/gestao-de-emails.git
cd gestao-de-emails
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais
nano .env  # ou use seu editor preferido
```

**Configuração mínima do `.env`:**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.vgzylypzrudzrhueoros.supabase.co:5432/postgres
REDIS_URL=redis://default:[PASSWORD]@enabled-camel-28915.upstash.io:6379
JWT_SECRET=sua-chave-secreta-aqui
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

**Configuração mínima do `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://vgzylypzrudzrhueoros.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Configurar Banco de Dados

```bash
cd ../backend

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# (Opcional) Popular com dados de exemplo
npm run seed
```

---

## 🐳 Desenvolvimento com Docker (Recomendado)

### Iniciar Todos os Serviços

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso iniciará:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- Backend API (porta 3000)
- Frontend (porta 3001)
- Workers (email-sender, email-processor, webhook-dispatcher)
- Redis Commander (porta 8081)

### Comandos Úteis

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild de um serviço
docker-compose up -d --build backend
```

---

## 💻 Desenvolvimento Local (Sem Docker)

### Terminal 1: Backend API

```bash
cd backend
npm run dev
```

Backend estará disponível em: http://localhost:3000

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Frontend estará disponível em: http://localhost:3001

### Terminal 3: Workers (Opcional)

```bash
cd backend

# Em terminais separados ou usando screen/tmux:
npm run worker:sender     # Email sender worker
npm run worker:email      # Email processor worker
npm run worker:webhook    # Webhook dispatcher worker
```

---

## 🧪 Testes

### Backend

```bash
cd backend

# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Executar testes para CI
npm run test:ci
```

### Frontend

```bash
cd frontend

# Executar testes (quando implementados)
npm test
```

### Verificar Cobertura

Após executar `npm run test:coverage`, abra:
```bash
open coverage/lcov-report/index.html
```

---

## 🗄️ Banco de Dados

### Prisma Studio (UI Visual)

```bash
cd backend
npm run prisma:studio
```

Abre em: http://localhost:5555

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco de dados (⚠️ CUIDADO)
npx prisma migrate reset
```

### Gerar Prisma Client

Sempre que alterar o `schema.prisma`:
```bash
npx prisma generate
```

---

## 📡 API REST

### Health Check

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/detailed
```

### Autenticação

```bash
# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tomasbalestrin@gmail.com",
    "password": "12345678"
  }'

# Usar token
export TOKEN="seu-token-jwt"
curl http://localhost:3000/api/tickets \
  -H "Authorization: Bearer $TOKEN"
```

### Documentação Completa

Consulte [backend/API.md](./backend/API.md) para documentação completa da API.

---

## 🔍 Debugging

### VS Code Launch Configuration

Crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--runInBand"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

### Logs

**Backend:**
```bash
# Logs estruturados (Pino)
tail -f backend/logs/app.log | npx pino-pretty
```

**Frontend:**
```bash
# Logs do Next.js no console do navegador (F12)
```

---

## 🏗️ Estrutura do Projeto

```
gestao-de-emails/
├── backend/                    # API Fastify
│   ├── src/
│   │   ├── modules/           # Módulos da aplicação
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── tickets/      # Tickets
│   │   │   ├── messages/     # Mensagens
│   │   │   ├── webhooks/     # Webhooks
│   │   │   └── health/       # Health checks
│   │   ├── workers/          # BullMQ workers
│   │   ├── services/         # Serviços (SES, R2, Logger)
│   │   ├── config/           # Configurações
│   │   ├── middleware/       # Middlewares
│   │   ├── utils/            # Utilitários
│   │   ├── types/            # TypeScript types
│   │   ├── app.ts            # Configuração Fastify
│   │   └── server.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Schema do banco
│   │   ├── migrations/       # Migrations
│   │   └── seed.ts           # Seed de dados
│   ├── __tests__/            # Testes de integração
│   ├── jest.config.js        # Configuração Jest
│   ├── Dockerfile            # Docker image
│   └── package.json
│
├── frontend/                  # Next.js App
│   ├── app/                  # App Router
│   │   ├── (auth)/          # Rotas de autenticação
│   │   ├── (dashboard)/     # Dashboard protegido
│   │   └── api/             # API Routes
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base (shadcn)
│   │   ├── emails/         # Componentes de email
│   │   ├── admin/          # Componentes admin
│   │   └── layout/         # Layout components
│   ├── lib/                 # Bibliotecas
│   │   ├── supabase.ts     # Client Supabase
│   │   ├── api.ts          # API client
│   │   └── utils.ts        # Utilitários
│   ├── hooks/               # React hooks customizados
│   ├── Dockerfile           # Docker image
│   └── package.json
│
├── docker-compose.yml        # Orquestração Docker
├── .env.example             # Exemplo de variáveis
├── README.md                # Documentação geral
├── DEVELOPMENT.md           # Este arquivo
└── API.md                   # Documentação da API
```

---

## 📝 Convenções de Código

### TypeScript

- Use **interfaces** para objetos públicos
- Use **types** para unions e helpers
- Sempre tipar retornos de funções
- Evitar `any`, usar `unknown` quando necessário

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Adicionar endpoint de busca de tickets
fix: Corrigir erro no parser de email
docs: Atualizar documentação da API
test: Adicionar testes para validators
refactor: Simplificar lógica de autenticação
chore: Atualizar dependências
```

### Branches

```
main              # Produção
develop           # Desenvolvimento
feature/nome      # Novas funcionalidades
fix/nome          # Correções
hotfix/nome       # Correções urgentes
```

### Pull Requests

1. Criar branch a partir de `develop`
2. Implementar mudanças
3. Adicionar testes
4. Atualizar documentação
5. Criar PR para `develop`
6. Aguardar revisão

---

## 🔒 Segurança

### Variáveis Sensíveis

- **NUNCA** commitar arquivos `.env`
- Usar `.env.example` como template
- Rotacionar credenciais regularmente

### Autenticação

- JWTs expiram em 7 dias (configurável)
- Senhas hash com bcrypt (10 rounds)
- Rate limiting ativo (100 req/min)

### Validação

- Todos os inputs são validados com Zod
- HTML sanitizado antes de armazenar
- SQL injection prevenido via Prisma

---

## 🚀 Deploy

### Preparação

```bash
# Backend
cd backend
npm run build
npm run test:ci

# Frontend
cd frontend
npm run build
```

### Ambientes

- **Development**: Branches feature/*
- **Staging**: Branch develop
- **Production**: Branch main

### Verificação Pré-Deploy

```bash
# Backend
npm run build          # Build sem erros
npm run test:ci        # Todos os testes passando
npm run prisma:generate # Prisma client atualizado

# Frontend
npm run build          # Build sem erros
npm run lint           # Sem erros de lint
```

---

## 📊 Monitoramento

### Health Checks

- `/health` - Check básico
- `/health/detailed` - Status completo
- `/health/ready` - Kubernetes readiness
- `/health/live` - Kubernetes liveness

### Logs

Backend usa **Pino** para logs estruturados:
```typescript
logger.info('Ticket criado', { ticketId, userId });
logger.error('Erro ao processar email', { error });
```

### Métricas

- Uptime do servidor
- Latência de DB e Redis
- Uso de memória
- Taxa de erros

---

## 🐛 Troubleshooting

### Problema: Erro de conexão com banco

**Solução:**
```bash
# Verificar DATABASE_URL no .env
# Testar conexão
psql $DATABASE_URL

# Regenerar Prisma Client
npx prisma generate
```

### Problema: Redis não conecta

**Solução:**
```bash
# Verificar Redis local
redis-cli ping

# Ou verificar Upstash
curl https://enabled-camel-28915.upstash.io:6379
```

### Problema: Testes falhando

**Solução:**
```bash
# Limpar cache do Jest
npm test -- --clearCache

# Verificar variáveis de ambiente de teste
cat .env.test
```

### Problema: Frontend não carrega

**Solução:**
```bash
# Limpar cache Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar variáveis de ambiente
cat .env.local
```

---

## 📚 Recursos Úteis

### Documentação

- [Fastify](https://www.fastify.io/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [BullMQ](https://docs.bullmq.io/)
- [Supabase](https://supabase.com/docs)
- [AWS SES](https://docs.aws.amazon.com/ses/)

### Ferramentas

- [Postman](https://www.postman.com/) - Testar API
- [Insomnia](https://insomnia.rest/) - Alternativa ao Postman
- [TablePlus](https://tableplus.com/) - Client de banco de dados
- [RedisInsight](https://redis.com/redis-enterprise/redis-insight/) - UI para Redis

---

## 🤝 Contribuindo

1. Fork o projeto
2. Criar branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 👥 Time

- **Desenvolvedor Principal**: Tomas Balestrin
- **Email**: tomasbalestrin@gmail.com

---

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

**Última atualização:** 2025-12-19
