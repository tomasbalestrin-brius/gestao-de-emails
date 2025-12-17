"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { EmailListItem } from "@/components/emails/email-list-item"
import { Button } from "@/components/ui/button"
import { PenSquare } from "lucide-react"
import { emailsService } from "@/lib/emails"
import type { EmailMessage } from "@/lib/types"

export default function SentPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    try {
      setLoading(true)
      const data = await emailsService.getByFolder("sent")
      setEmails(data)
    } catch (error) {
      console.error("[v0] Error loading sent emails:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmails = emails.filter((email) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      email.assunto.toLowerCase().includes(query) ||
      email.destinatarios.some((d) => d.toLowerCase().includes(query)) ||
      email.corpo.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col">
      <Header
        title="Enviados"
        description="Emails que você enviou"
        showSearch
        onSearch={setSearchQuery}
        action={
          <Button onClick={() => router.push("/compose")} className="gap-2">
            <PenSquare className="h-4 w-4" />
            {"Compor"}
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-muted-foreground">{"Carregando emails..."}</div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-muted-foreground">{"Nenhum email enviado"}</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Tente ajustar sua busca" : "Você ainda não enviou nenhum email"}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredEmails.map((email) => (
                <EmailListItem key={email.id} email={email} folder="sent" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
