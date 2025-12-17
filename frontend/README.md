# 📧 Sistema de Gestão de Emails - Frontend

Frontend Next.js 16 para o sistema de gestão de emails com suporte a tickets, respostas e anexos.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Supabase** - Backend e banco de dados
- **Tailwind CSS 4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Recharts** - Gráficos e visualizações
- **Shadcn/ui** - Biblioteca de componentes

## 📋 Pré-requisitos

- Node.js 20 LTS ou superior
- npm, yarn ou pnpm
- Banco de dados Supabase configurado (veja `/backend/setup-frontend-schema-v2.sql`)

## 🔧 Configuração

### 1. Instalar Dependências

```bash
cd frontend
npm install
# ou
pnpm install
# ou
yarn install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais (já configurado):

```env
NEXT_PUBLIC_SUPABASE_URL=https://vgzylypzrudzrhueoros.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Executar o Banco de Dados

Se ainda não executou, rode o script SQL no Supabase:

```bash
# O script está em: /backend/setup-frontend-schema-v2.sql
# Execute no Supabase SQL Editor: https://supabase.com/dashboard/project/vgzylypzrudzrhueoros/sql
```

## 🎯 Executar o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

### Build para Produção

```bash
npm run build
npm run start
```

## 👤 Login

Após executar o script SQL, você terá os seguintes usuários:

**Admin:**
- Email: `tomasbalestrin@gmail.com`
- Senha: `12345678`

**Agente:**
- Email: `agente@example.com`
- Senha: `admin123`

## 📁 Estrutura do Projeto

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas do dashboard
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── ...               # Componentes específicos
├── contexts/             # React Contexts (Auth, etc)
├── hooks/                # Custom React Hooks
├── lib/                  # Utilitários e configurações
│   └── supabase.ts       # Cliente Supabase
├── public/               # Arquivos estáticos
└── styles/               # Estilos globais
```

## 🎨 Funcionalidades

### ✅ Implementado

- **Autenticação**
  - Login com email/senha
  - Proteção de rotas
  - Gerenciamento de sessão

- **Dashboard**
  - Visão geral de tickets
  - Estatísticas em tempo real
  - Filtros e busca

- **Tickets**
  - Listagem com paginação
  - Visualização detalhada
  - Filtros por status/prioridade
  - Sistema de tags

- **Emails**
  - Thread de conversas
  - Responder tickets
  - Formatação rich text
  - Anexos (preparado)

- **Admin**
  - Gerenciamento de usuários
  - Configurações do sistema
  - Logs e auditoria

### 🔄 Em Desenvolvimento

- Integração com Backend API Fastify
- Upload de anexos (Cloudflare R2)
- Notificações em tempo real
- Webhooks externos

## 🔌 Integração com Backend

O frontend está preparado para integração com a API Fastify:

1. Configure `NEXT_PUBLIC_API_URL` no `.env.local`
2. Substitua chamadas diretas ao Supabase por chamadas HTTP
3. Use JWT tokens do backend para autenticação

## 🎨 Temas

O sistema suporta tema claro/escuro automaticamente.

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to Supabase"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o script SQL foi executado
- Verifique o console do navegador para erros específicos

### Erro: "User not found"
- Certifique-se de que executou o script SQL
- Verifique se os usuários existem na tabela `usuarios`
- Confirme as credenciais de login

### Erro: RLS Policy
- Verifique se as políticas RLS foram criadas
- Confirme que RLS está habilitado nas tabelas
- O script SQL inclui políticas permissivas para desenvolvimento

## 🔒 Segurança

**Desenvolvimento:**
- Políticas RLS permissivas (`FOR ALL USING (true)`)
- Ideal para testes e desenvolvimento

**Produção:**
- Implementar políticas RLS baseadas em `auth.uid()`
- Restringir acesso por papéis (admin/agente)
- Validar permissões no backend

## 📚 Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives)

## 🤝 Contribuindo

1. Faça suas alterações
2. Teste localmente
3. Commit com mensagens descritivas
4. Push para o repositório

## 📄 Licença

Propriedade de Tomas Balestrin - Todos os direitos reservados.
