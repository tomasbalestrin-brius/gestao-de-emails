import { type NextRequest, NextResponse } from "next/server"
import { sesService } from "@/lib/ses-service"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { EnviarEmailRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const emailData: EnviarEmailRequest = body

    console.log("[v0] API: Enviando email para:", emailData.para)

    // Validar dados
    if (!emailData.para || emailData.para.length === 0) {
      return NextResponse.json({ error: "Destinatários são obrigatórios" }, { status: 400 })
    }

    if (!emailData.assunto) {
      return NextResponse.json({ error: "Assunto é obrigatório" }, { status: 400 })
    }

    if (!emailData.corpo && !emailData.html) {
      return NextResponse.json({ error: "Corpo do email é obrigatório" }, { status: 400 })
    }

    const supabase = getSupabaseBrowserClient()
    let messageId = null

    // Tentar enviar via SES se configurado
    if (sesService.isConfigured()) {
      try {
        const result = await sesService.sendEmail(emailData)
        messageId = result.messageId
        console.log("[v0] Email enviado via SES, MessageId:", messageId)
      } catch (error: any) {
        console.error("[v0] Erro ao enviar via SES, salvando apenas no banco:", error.message)
      }
    } else {
      console.log("[v0] SES não configurado, salvando email apenas no banco")
    }

    // Determinar thread_id
    let threadId = null
    if (emailData.em_resposta_a) {
      const { data: originalEmail } = await supabase
        .from("emails")
        .select("thread_id")
        .eq("id", emailData.em_resposta_a)
        .single()
      threadId = originalEmail?.thread_id
    }

    // Salvar email no banco
    const { data, error } = await supabase
      .from("emails")
      .insert({
        thread_id: threadId,
        em_resposta_a: emailData.em_resposta_a,
        remetente: "suporte@example.com", // TODO: Pegar do usuário autenticado
        destinatarios: emailData.para,
        cc: emailData.cc,
        bcc: emailData.bcc,
        assunto: emailData.assunto,
        corpo: emailData.corpo,
        html: emailData.html,
        pasta: "sent",
        lido: true,
        importante: false,
        tipo: "enviado",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao salvar email no banco:", error)
      return NextResponse.json({ error: "Falha ao salvar email" }, { status: 500 })
    }

    console.log("[v0] Email salvo no banco com ID:", data.id)

    return NextResponse.json({
      success: true,
      email: data,
      sentViaSES: messageId !== null,
      messageId,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao processar envio de email:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
