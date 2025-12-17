export interface User {
  id: number
  nome: string
  email: string
  papel: "admin" | "agente"
  criado_em: string
  atualizado_em: string
}

export interface Ticket {
  id: number
  assunto: string
  status: "aberto" | "em_andamento" | "resolvido" | "fechado"
  prioridade: "baixa" | "media" | "alta"
  cliente_email: string
  cliente_nome?: string
  criado_em: string
  atualizado_em: string
  atribuido_a?: number
  agente?: User
}

export interface Email {
  id: number
  ticket_id: number
  remetente: string
  destinatarios: string[]
  assunto: string
  corpo: string
  html?: string
  anexos?: Anexo[]
  tipo: "recebido" | "enviado"
  criado_em: string
}

export interface Anexo {
  id: number
  nome_arquivo: string
  tipo_conteudo: string
  tamanho: number
  url: string
}

export interface TicketDetalhes extends Ticket {
  emails: Email[]
}

export interface AuthResponse {
  token: string
  usuario: User
}

export interface TicketStats {
  total: number
  abertos: number
  emAndamento: number
  resolvidosHoje: number
}

export interface EmailMessage {
  id: number
  thread_id?: number
  em_resposta_a?: number
  remetente: string
  destinatarios: string[]
  cc?: string[]
  bcc?: string[]
  assunto: string
  corpo: string
  html?: string
  pasta: "inbox" | "sent" | "drafts" | "trash" | "spam" | "archived"
  lido: boolean
  importante: boolean
  tipo: "recebido" | "enviado"
  anexos?: Anexo[]
  criado_em: string
}

export interface EmailThread {
  thread_id: number
  assunto: string
  participantes: string[]
  total_mensagens: number
  ultima_mensagem: string
  lido: boolean
  importante: boolean
  pasta: string
}

export interface Rascunho {
  id: number
  usuario_id: number
  para: string[]
  cc?: string[]
  bcc?: string[]
  assunto?: string
  corpo?: string
  html?: string
  criado_em: string
  atualizado_em: string
}

export interface ConfiguracaoEmail {
  id: number
  usuario_id: number
  email_principal: string
  nome_exibicao?: string
  assinatura?: string
  ses_configurado: boolean
  ses_identity_arn?: string
}

export interface EmailStats {
  total: number
  nao_lidos: number
  importantes: number
  hoje: number
}

export interface EnviarEmailRequest {
  para: string[]
  cc?: string[]
  bcc?: string[]
  assunto: string
  corpo: string
  html?: string
  em_resposta_a?: number
  anexos?: File[]
}

export interface SESWebhookPayload {
  Type: string
  MessageId: string
  TopicArn: string
  Subject?: string
  Message: string
  Timestamp: string
  SignatureVersion: string
  Signature: string
  SigningCertURL: string
  UnsubscribeURL: string
}

export interface SESEmailNotification {
  notificationType: "Received"
  mail: {
    timestamp: string
    source: string
    messageId: string
    destination: string[]
    headersTruncated: boolean
    headers: Array<{ name: string; value: string }>
    commonHeaders: {
      from: string[]
      to: string[]
      cc?: string[]
      subject: string
      date: string
      messageId: string
    }
  }
  receipt: {
    timestamp: string
    recipients: string[]
    spamVerdict: { status: string }
    virusVerdict: { status: string }
    spfVerdict: { status: string }
    dkimVerdict: { status: string }
    dmarcVerdict: { status: string }
  }
  content?: string
}

export interface EmailTemplate {
  id: number
  usuario_id: number
  nome: string
  assunto: string
  corpo: string
  html?: string
  criado_em: string
  atualizado_em: string
}

export interface SESConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  identityArn?: string
  fromEmail: string
  fromName?: string
}
