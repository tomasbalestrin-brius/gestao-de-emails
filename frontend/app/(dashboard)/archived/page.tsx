"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { EmailListItem } from "@/components/emails/email-list-item"
import { Button } from "@/components/ui/button"
import { PenSquare } from "lucide-react"
import { emailsService } from "@/lib/emails"
import type { EmailMessage } from "@/lib/types"

export default function ArchivedPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    try {
      setLoading(true)
      const data = await emailsService.getByFolder("archived")
      setEmails(data)
    } catch (error) {
      console.error("[v0] Error loading archived emails:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Arquivados"
        description="Emails arquivados"
        action={
          <Button onClick={() => router.push("/compose")} className="gap-2">
            <PenSquare className="h-4 w-4" />
            {"Compor"}
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">{"Carregando emails..."}</div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">{"Nenhum email arquivado"}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {emails.map((email) => (
              <EmailListItem key={email.id} email={email} folder="archived" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
