-- Migration: Criar estrutura completa do banco de dados
-- Execute este SQL no SQL Editor do Supabase

-- Criar ENUMs
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT');
CREATE TYPE "TicketStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'REOPENED');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- Tabela: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Tabela: tickets
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_name" TEXT,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'NEW',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "email_message_id" TEXT NOT NULL,
    "email_references" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- Tabela: messages
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_text" TEXT NOT NULL,
    "body_html" TEXT,
    "stripped_text" TEXT,
    "message_id" TEXT NOT NULL,
    "in_reply_to" TEXT,
    "references" TEXT,
    "has_attachments" BOOLEAN NOT NULL DEFAULT false,
    "attachment_count" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Tabela: attachments
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "r2_key" TEXT NOT NULL,
    "r2_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- Tabela: email_configs
CREATE TABLE "email_configs" (
    "id" TEXT NOT NULL,
    "ses_region" TEXT NOT NULL,
    "ses_access_key" TEXT NOT NULL,
    "ses_secret_key" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_configs_pkey" PRIMARY KEY ("id")
);

-- Tabela: webhook_configs
CREATE TABLE "webhook_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "headers" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retry_count" INTEGER NOT NULL DEFAULT 3,
    "timeout_ms" INTEGER NOT NULL DEFAULT 30000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_configs_pkey" PRIMARY KEY ("id")
);

-- Tabela: webhook_logs
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "webhook_config_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status_code" INTEGER,
    "response_body" TEXT,
    "error_message" TEXT,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- Tabela: system_logs
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- Criar UNIQUE constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "tickets_email_message_id_key" ON "tickets"("email_message_id");
CREATE UNIQUE INDEX "messages_message_id_key" ON "messages"("message_id");

-- Criar indexes
CREATE INDEX "tickets_customer_email_idx" ON "tickets"("customer_email");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "tickets_created_at_idx" ON "tickets"("created_at");
CREATE INDEX "messages_ticket_id_idx" ON "messages"("ticket_id");
CREATE INDEX "attachments_message_id_idx" ON "attachments"("message_id");
CREATE INDEX "webhook_logs_webhook_config_id_idx" ON "webhook_logs"("webhook_config_id");
CREATE INDEX "webhook_logs_created_at_idx" ON "webhook_logs"("created_at");
CREATE INDEX "system_logs_level_idx" ON "system_logs"("level");
CREATE INDEX "system_logs_created_at_idx" ON "system_logs"("created_at");

-- Criar Foreign Keys
ALTER TABLE "messages" ADD CONSTRAINT "messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_webhook_config_id_fkey" FOREIGN KEY ("webhook_config_id") REFERENCES "webhook_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
