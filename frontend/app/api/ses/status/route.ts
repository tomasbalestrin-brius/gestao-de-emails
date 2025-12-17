import { NextResponse } from "next/server"
import { sesService } from "@/lib/ses-service"

export async function GET() {
  try {
    const configured = sesService.isConfigured()

    return NextResponse.json({
      configured,
      message: configured
        ? "AWS SES está configurado e pronto para uso"
        : "AWS SES não está configurado. Adicione as variáveis de ambiente necessárias.",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
