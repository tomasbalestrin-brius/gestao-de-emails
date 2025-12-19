# 📚 API Documentation - Sistema de Gestão de Emails

## 📌 Base URL

**Development:** `http://localhost:3000`
**Production:** `https://seu-dominio.com`

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT token.

**Header:**
```
Authorization: Bearer {seu_token_jwt}
```

---

## 🏥 Health Checks

### GET /health

Health check básico e rápido.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

---

### GET /health/detailed

Health check detalhado com status de todos os serviços.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-19T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "up",
      "responseTime": 12
    },
    "redis": {
      "status": "up",
      "responseTime": 8
    },
    "memory": {
      "status": "up",
      "used": "256MB",
      "total": "512MB",
      "percentage": 50
    }
  }
}
```

**Status Codes:**
- `200` - Todos os serviços operacionais
- `207` - Alguns serviços degradados
- `503` - Sistema não operacional

---

### GET /health/ready

Readiness probe para Kubernetes/Docker.

**Response:**
```json
{
  "status": "ready"
}
```

**Status Codes:**
- `200` - Sistema pronto para receber requisições
- `503` - Sistema não está pronto

---

### GET /health/live

Liveness probe para Kubernetes/Docker.

**Response:**
```json
{
  "status": "alive"
}
```

---

## 🔑 Autenticação

### POST /auth/register

Registrar novo usuário.

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "AGENT"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "AGENT",
    "createdAt": "2025-12-19T10:30:00.000Z"
  }
}
```

**Roles disponíveis:**
- `ADMIN` - Administrador (acesso total)
- `AGENT` - Agente de suporte

---

### POST /auth/login

Fazer login.

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "AGENT"
  }
}
```

**Status Codes:**
- `200` - Login bem-sucedido
- `401` - Credenciais inválidas

---

### GET /auth/me

Obter informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "role": "AGENT",
  "createdAt": "2025-12-19T10:30:00.000Z"
}
```

---

## 🎫 Tickets

### GET /api/tickets

Listar tickets com filtros e paginação.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (opcional) - Filtrar por status: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- `priority` (opcional) - Filtrar por prioridade: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `assignedTo` (opcional) - Filtrar por agente (UUID)
- `search` (opcional) - Buscar em assunto e conteúdo
- `page` (opcional, default: 1) - Número da página
- `limit` (opcional, default: 20) - Itens por página

**Exemplo:**
```
GET /api/tickets?status=OPEN&priority=HIGH&page=1&limit=10
```

**Response:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "subject": "Problema com login",
      "status": "OPEN",
      "priority": "HIGH",
      "customerEmail": "cliente@exemplo.com",
      "customerName": "Nome Cliente",
      "assignedTo": "uuid-agente",
      "assignedToName": "Nome Agente",
      "tags": ["login", "urgente"],
      "createdAt": "2025-12-19T10:00:00.000Z",
      "updatedAt": "2025-12-19T10:30:00.000Z",
      "messagesCount": 5,
      "lastMessageAt": "2025-12-19T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

### GET /api/tickets/:id

Obter detalhes de um ticket específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "subject": "Problema com login",
  "status": "OPEN",
  "priority": "HIGH",
  "customerEmail": "cliente@exemplo.com",
  "customerName": "Nome Cliente",
  "assignedTo": "uuid-agente",
  "assignedToName": "Nome Agente",
  "tags": ["login", "urgente"],
  "createdAt": "2025-12-19T10:00:00.000Z",
  "updatedAt": "2025-12-19T10:30:00.000Z",
  "messages": [
    {
      "id": "uuid",
      "content": "Não consigo fazer login",
      "isFromCustomer": true,
      "senderEmail": "cliente@exemplo.com",
      "senderName": "Nome Cliente",
      "createdAt": "2025-12-19T10:00:00.000Z",
      "attachments": []
    },
    {
      "id": "uuid",
      "content": "Vamos verificar o problema",
      "isFromCustomer": false,
      "senderEmail": "agente@empresa.com",
      "senderName": "Nome Agente",
      "createdAt": "2025-12-19T10:30:00.000Z",
      "attachments": []
    }
  ]
}
```

---

### GET /api/tickets/stats

Obter estatísticas de tickets.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (opcional) - Período: `today`, `week`, `month`, `all` (default: `all`)

**Response:**
```json
{
  "total": 150,
  "byStatus": {
    "OPEN": 45,
    "IN_PROGRESS": 30,
    "RESOLVED": 50,
    "CLOSED": 25
  },
  "byPriority": {
    "LOW": 30,
    "MEDIUM": 60,
    "HIGH": 40,
    "URGENT": 20
  },
  "averageResolutionTime": 7200,
  "averageResponseTime": 1800
}
```

---

### PATCH /api/tickets/:id/status

Atualizar status de um ticket.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "IN_PROGRESS",
  "updatedAt": "2025-12-19T10:30:00.000Z"
}
```

**Status disponíveis:**
- `OPEN` - Aberto
- `IN_PROGRESS` - Em andamento
- `RESOLVED` - Resolvido
- `CLOSED` - Fechado

---

### PATCH /api/tickets/:id/priority

Atualizar prioridade de um ticket.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "priority": "URGENT"
}
```

**Response:**
```json
{
  "id": "uuid",
  "priority": "URGENT",
  "updatedAt": "2025-12-19T10:30:00.000Z"
}
```

**Prioridades disponíveis:**
- `LOW` - Baixa
- `MEDIUM` - Média
- `HIGH` - Alta
- `URGENT` - Urgente

---

### POST /api/tickets/:id/tags

Atualizar tags de um ticket.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "tags": ["login", "urgente", "bug"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "tags": ["login", "urgente", "bug"],
  "updatedAt": "2025-12-19T10:30:00.000Z"
}
```

---

### POST /api/tickets/:id/reply

Responder a um ticket.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "content": "Consegui resolver o problema!",
  "attachments": [
    {
      "filename": "screenshot.png",
      "url": "https://r2.example.com/screenshot.png",
      "size": 102400,
      "mimeType": "image/png"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "ticketId": "ticket-uuid",
  "content": "Consegui resolver o problema!",
  "isFromCustomer": false,
  "senderEmail": "agente@empresa.com",
  "senderName": "Nome Agente",
  "createdAt": "2025-12-19T10:30:00.000Z",
  "attachments": [
    {
      "id": "uuid",
      "filename": "screenshot.png",
      "url": "https://r2.example.com/screenshot.png",
      "size": 102400,
      "mimeType": "image/png"
    }
  ]
}
```

---

## 🔔 Webhooks

### POST /webhooks/inbound-email

Receber emails via AWS SNS/SES.

**Headers:**
```
x-amz-sns-message-type: Notification
```

**Request:**
```json
{
  "Type": "Notification",
  "Message": "{\"mail\":{\"source\":\"cliente@exemplo.com\",\"destination\":[\"suporte@empresa.com\"],\"subject\":\"Problema urgente\"},\"content\":\"Conteúdo do email...\"}"
}
```

**Response:**
```json
{
  "received": true,
  "ticketId": "uuid"
}
```

**Status Codes:**
- `200` - Email processado com sucesso
- `400` - Formato inválido
- `500` - Erro no processamento

---

## 📝 Rate Limiting

Todos os endpoints têm rate limiting configurado:

- **Limite:** 100 requisições por minuto por IP
- **Header de resposta:** `X-RateLimit-Remaining`

**Quando exceder:**
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded"
}
```

---

## ❌ Códigos de Erro

### Códigos HTTP

- `200` - Sucesso
- `201` - Criado
- `204` - Sem conteúdo
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `422` - Validação falhou
- `429` - Rate limit excedido
- `500` - Erro interno
- `503` - Serviço indisponível

### Formato de Erro

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

---

## 🔧 Exemplos com cURL

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@exemplo.com",
    "password": "senha123"
  }'
```

### Listar Tickets
```bash
curl http://localhost:3000/api/tickets?status=OPEN \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Resposta
```bash
curl -X POST http://localhost:3000/api/tickets/UUID/reply \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Problema resolvido!"
  }'
```

### Health Check
```bash
curl http://localhost:3000/health/detailed
```

---

## 🚀 WebSocket (Futuro)

Em desenvolvimento:
- `ws://localhost:3000/ws` - Notificações em tempo real

---

## 📦 Paginação

Endpoints que retornam listas incluem metadados de paginação:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔍 Filtros

### Operadores de busca:
- `search` - Busca em texto
- `status` - Filtro exato
- `priority` - Filtro exato
- `assignedTo` - UUID do agente
- `createdAfter` - Data ISO (>)
- `createdBefore` - Data ISO (<)

**Exemplo:**
```
GET /api/tickets?search=login&status=OPEN&createdAfter=2025-12-01T00:00:00Z
```

---

## 📊 Monitoramento

### Métricas disponíveis em /health/detailed

- Uptime do servidor
- Uso de memória
- Latência do banco de dados
- Latência do Redis
- Versão da aplicação

---

## 🛡️ Segurança

### Headers de Segurança

Todos os endpoints incluem:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (em HTTPS)

### CORS

Configurado para permitir origens específicas em produção.

**Development:** `*`
**Production:** Domínios configurados

---

## 📚 SDKs e Bibliotecas

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Listar tickets
const tickets = await api.get('/api/tickets');

// Criar resposta
const reply = await api.post(`/api/tickets/${ticketId}/reply`, {
  content: 'Resposta aqui'
});
```

---

## 🔄 Versionamento

Versão atual: **v1.0.0**

Futuras versões terão prefixo:
- `/v1/api/tickets`
- `/v2/api/tickets`

---

## 📧 Suporte

Para dúvidas sobre a API:
- **Email:** tomasbalestrin@gmail.com
- **Documentação:** Este arquivo
- **Status:** https://seu-dominio.com/health/detailed

---

## 🎯 Próximas Funcionalidades

- [ ] WebSocket para notificações em tempo real
- [ ] GraphQL API
- [ ] Bulk operations
- [ ] Exportação de dados (CSV, PDF)
- [ ] Webhooks configuráveis
- [ ] API v2 com melhorias

---

**Última atualização:** 2025-12-19
