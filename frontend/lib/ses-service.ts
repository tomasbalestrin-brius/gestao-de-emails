import type { SESConfig, EnviarEmailRequest } from "./types"

const isBrowser = typeof window !== "undefined"

// Configuração SES - deve vir de variáveis de ambiente
const getSESConfig = (): SESConfig | null => {
  if (isBrowser) {
    // No browser, não expor credenciais
    return null
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION || "us-east-1"
  const fromEmail = process.env.SES_FROM_EMAIL
  const fromName = process.env.SES_FROM_NAME
  const identityArn = process.env.SES_IDENTITY_ARN

  if (!accessKeyId || !secretAccessKey || !fromEmail) {
    console.log("[v0] SES não configurado - variáveis de ambiente faltando")
    return null
  }

  return {
    region,
    accessKeyId,
    secretAccessKey,
    identityArn,
    fromEmail,
    fromName,
  }
}

export const sesService = {
  isConfigured(): boolean {
    return getSESConfig() !== null
  },

  async sendEmail(emailData: EnviarEmailRequest): Promise<{ messageId: string }> {
    const config = getSESConfig()

    if (!config) {
      throw new Error("SES não está configurado. Configure as variáveis de ambiente AWS.")
    }

    console.log("[v0] Enviando email via SES para:", emailData.para)

    try {
      // Importar AWS SDK apenas no servidor
      const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses")

      const client = new SESClient({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      })

      const command = new SendEmailCommand({
        Source: config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail,
        Destination: {
          ToAddresses: emailData.para,
          CcAddresses: emailData.cc,
          BccAddresses: emailData.bcc,
        },
        Message: {
          Subject: {
            Data: emailData.assunto,
            Charset: "UTF-8",
          },
          Body: emailData.html
            ? {
                Html: {
                  Data: emailData.html,
                  Charset: "UTF-8",
                },
              }
            : {
                Text: {
                  Data: emailData.corpo,
                  Charset: "UTF-8",
                },
              },
        },
      })

      const response = await client.send(command)

      console.log("[v0] Email enviado via SES com sucesso, MessageId:", response.MessageId)

      return {
        messageId: response.MessageId || "",
      }
    } catch (error: any) {
      console.error("[v0] Erro ao enviar email via SES:", error)
      throw new Error(`Falha ao enviar email via SES: ${error.message}`)
    }
  },

  async verifyEmailIdentity(email: string): Promise<void> {
    const config = getSESConfig()

    if (!config) {
      throw new Error("SES não está configurado")
    }

    const { SESClient, VerifyEmailIdentityCommand } = await import("@aws-sdk/client-ses")

    const client = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })

    const command = new VerifyEmailIdentityCommand({
      EmailAddress: email,
    })

    await client.send(command)

    console.log("[v0] Email de verificação enviado para:", email)
  },
}
