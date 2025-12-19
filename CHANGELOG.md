# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2025-12-19

### Adicionado

#### Backend
- **Health Check Avançado**: Novo módulo de health check com endpoints detalhados
  - `GET /health` - Health check básico
  - `GET /health/detailed` - Status completo de todos os serviços
  - `GET /health/ready` - Readiness probe para Kubernetes
  - `GET /health/live` - Liveness probe para Kubernetes
  - Verificação automática de PostgreSQL, Redis e memória

- **Testes Unitários**: Configuração completa de testes com Jest
  - Testes para health check endpoints
  - Testes para email parser
  - Testes para validators
  - Configuração de cobertura de código
  - Scripts: `test`, `test:watch`, `test:coverage`, `test:ci`

- **Docker Support**: Ambiente completo de desenvolvimento Docker
  - `docker-compose.yml` com todos os serviços
  - Dockerfiles otimizados para backend e frontend
  - Multi-stage builds para produção
  - Health checks integrados
  - Redis Commander para debugging

#### Documentação
- **API.md**: Documentação completa da API REST
  - Todos os endpoints documentados
  - Exemplos de requisição e resposta
  - Códigos de erro e rate limiting
  - Exemplos com cURL
  - Guia de autenticação

- **DEVELOPMENT.md**: Guia completo de desenvolvimento
  - Setup inicial passo a passo
  - Instruções para desenvolvimento local
  - Guia de Docker
  - Convenções de código
  - Troubleshooting
  - Recursos úteis

- **CHANGELOG.md**: Histórico de mudanças do projeto

#### DevOps
- `.dockerignore`: Arquivos ignorados no build Docker
- `.env.example`: Templates de variáveis de ambiente atualizados
- `jest.config.js`: Configuração completa do Jest

### Melhorado

#### Backend
- **Estrutura de Código**: Melhor organização de módulos
  - Health checks em módulo separado
  - Testes organizados em `__tests__/`

- **Configuração de Testes**:
  - Cobertura de código configurada
  - Timeout adequado para testes assíncronos
  - Mocks automáticos

#### Frontend
- Dockerfile otimizado com multi-stage build
- Health check endpoint configurado

### Correções

- Corrigido import do health controller no `app.ts`
- Ajustada configuração de rate limiting
- Melhorado tratamento de erros nos health checks

---

## [1.0.0] - 2025-12-15

### Adicionado

#### Backend
- API REST completa com Fastify
- Autenticação JWT com bcrypt
- CRUD completo de tickets
- Sistema de mensagens e respostas
- Workers BullMQ para processamento assíncrono:
  - Email sender worker
  - Email processor worker
  - Webhook dispatcher worker
- Integração com AWS SES
- Integração com Cloudflare R2
- Prisma ORM com PostgreSQL
- Redis para cache e filas
- Logging estruturado com Pino
- Rate limiting
- CORS configurado
- Helmet para segurança

#### Frontend
- Next.js 16 com App Router
- Autenticação completa
- Dashboard com estatísticas
- Sistema de tickets
- Visualização de emails
- Editor de emails
- Sistema de anexos
- Painel administrativo
- Componentes UI com Radix UI
- Gráficos com Recharts
- Integração com Supabase

#### Infraestrutura
- Banco de dados Supabase PostgreSQL
- Redis Upstash
- Schema completo com 8 tabelas
- Migrations automáticas
- Seed de dados de exemplo

#### Documentação
- README.md principal
- STATUS_FINAL.md com status do projeto
- DEPLOY.md com guia de deploy

### Tecnologias

**Backend:**
- Node.js 20
- TypeScript 5
- Fastify 4
- Prisma 5
- BullMQ 5
- AWS SDK v3
- Redis/ioredis
- JWT + bcrypt

**Frontend:**
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Radix UI
- Supabase Client
- Recharts
- Zod

**DevOps:**
- Docker
- PostgreSQL 16
- Redis 7

---

## Tipos de Mudanças

- **Adicionado**: Para novas funcionalidades
- **Melhorado**: Para mudanças em funcionalidades existentes
- **Deprecated**: Para funcionalidades que serão removidas
- **Removido**: Para funcionalidades removidas
- **Correções**: Para correções de bugs
- **Segurança**: Para correções de vulnerabilidades

---

## Links

- [Documentação da API](./backend/API.md)
- [Guia de Desenvolvimento](./DEVELOPMENT.md)
- [Guia de Deploy](./DEPLOY.md)
- [Status do Projeto](./STATUS_FINAL.md)

---

**Legenda de Versionamento:**
- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs
