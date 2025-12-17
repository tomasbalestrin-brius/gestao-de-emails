"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { EmailViewer } from "@/components/emails/email-viewer"
import { emailsService } from "@/lib/emails"
import type { EmailMessage } from "@/lib/types"

export default function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [email, setEmail] = useState<EmailMessage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmail()
  }, [resolvedParams.id])

  const loadEmail = async () => {
    try {
      setLoading(true)
      const data = await emailsService.getById(Number.parseInt(resolvedParams.id))
      setEmail(data)

      if (!data.lido) {
        await emailsService.markAsRead(data.id, true)
      }
    } catch (error) {
      console.error("[v0] Error loading email:", error)
      router.push("/inbox")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Carregando..." description="" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-muted-foreground">{"Carregando email..."}</div>
        </div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex flex-col">
        <Header title="Email não encontrado" description="" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-muted-foreground">{"Email não encontrado"}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title={email.assunto || "(Sem assunto)"} description="" />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <EmailViewer email={email} folder="inbox" onUpdate={loadEmail} />
        </div>
      </div>
    </div>
  )
}
