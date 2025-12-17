import { type NextRequest, NextResponse } from "next/server"
import type { SESWebhookPayload, SESEmailNotification } from "@/lib/types"
import { getSupabaseBrowserClient } from "@/lib/supabase"

// Função para validar assinatura SNS
async function validateSNSSignature(payload: SESWebhookPayload): Promise<boolean> {
  // TODO: Implementar validação de assinatura SNS completa
  // Por enquanto, apenas verificação básica
  return payload.Type === "Notification" || payload.Type === "SubscriptionConfirmation"
}

export async function POST(request: NextRequest) {
  try {
    const payload: SESWebhookPayload = await request.json()

    console.log("[v0] Webhook SES recebido:", payload.Type)

    // Validar assinatura
    const isValid = await validateSNSSignature(payload)
    if (!isValid) {
      console.error("[v0] Assinatura SNS inválida")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Lidar com confirmação de subscrição
    if (payload.Type === "SubscriptionConfirmation") {
      console.log("[v0] Confirmação de subscrição SNS recebida")
      // TODO: Confirmar subscrição automaticamente
      return NextResponse.json({ message: "Subscription confirmation received" })
    }

    // Processar notificação de email
    if (payload.Type === "Notification") {
      const message: SESEmailNotification = JSON.parse(payload.Message)

      if (message.notificationType === "Received") {
        console.log("[v0] Email recebido via SES:", message.mail.commonHeaders.subject)

        // Salvar email no banco de dados
        const supabase = getSupabaseBrowserClient()

        const emailData = {
          thread_id: null, // Será calculado depois baseado no assunto
          remetente: message.mail.commonHeaders.from[0],
          destinatarios: message.mail.commonHeaders.to,
          cc: message.mail.commonHeaders.cc,
          assunto: message.mail.commonHeaders.subject,
          corpo: message.content || "", // Conteúdo do email
          html: message.content, // TODO: Extrair HTML do conteúdo
          pasta: "inbox",
          lido: false,
          importante: false,
          tipo: "recebido",
        }

        const { data, error } = await supabase.from("emails").insert(emailData).select().single()

        if (error) {
          console.error("[v0] Erro ao salvar email recebido:", error)
          return NextResponse.json({ error: "Failed to save email" }, { status: 500 })
        }

        console.log("[v0] Email salvo no banco com ID:", data.id)

        // TODO: Processar anexos se houver
        // TODO: Criar ou atualizar thread baseado no assunto/In-Reply-To header

        return NextResponse.json({ message: "Email received and saved", emailId: data.id })
      }
    }

    return NextResponse.json({ message: "Webhook processed" })
  } catch (error: any) {
    console.error("[v0] Erro ao processar webhook SES:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Endpoint GET para verificação de health
export async function GET() {
  return NextResponse.json({ status: "ok", webhook: "ses" })
}
