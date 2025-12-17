"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { EmailStatsCards } from "@/components/emails/email-stats-cards"
import { EmailListItem } from "@/components/emails/email-list-item"
import { EmailSearch, type SearchFilters } from "@/components/emails/email-search"
import { MockModeBanner } from "@/components/layout/mock-mode-banner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { PenSquare, RefreshCw } from "lucide-react"
import { emailsService } from "@/lib/emails"
import type { EmailMessage, EmailStats } from "@/lib/types"

export default function InboxPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [stats, setStats] = useState<EmailStats>({ total: 0, nao_lidos: 0, importantes: 0, hoje: 0 })
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadEmails()
    loadStats()
  }, [])

  const loadEmails = async () => {
    try {
      setLoading(true)
      const data = await emailsService.getByFolder("inbox")
      setEmails(data)
    } catch (error) {
      console.error("[v0] Error loading emails:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await emailsService.getStats()
      setStats(data)
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadEmails(), loadStats()])
    setRefreshing(false)
  }

  const handleSearch = async (query: string, filters?: SearchFilters) => {
    if (!query && !filters) {
      loadEmails()
      return
    }

    try {
      setSearching(true)
      const results = await emailsService.search(query, { ...filters, pasta: "inbox" })
      setEmails(results)
    } catch (error) {
      console.error("[v0] Error searching emails:", error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Caixa de Entrada" description="Gerencie seus emails" />

      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-6">
          <MockModeBanner />

          <div className="flex items-center justify-between">
            <EmailStatsCards stats={stats} />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {"Atualizar"}
              </Button>

              <Button onClick={() => router.push("/compose")} className="gap-2">
                <PenSquare className="h-4 w-4" />
                {"Compor"}
              </Button>
            </div>
          </div>

          <EmailSearch onSearch={handleSearch} />

          <div className="space-y-4">
            {loading || searching ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground">{searching ? "Buscando emails..." : "Carregando emails..."}</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-muted-foreground">{"Nenhum email encontrado"}</p>
                <p className="text-sm text-muted-foreground">{"Sua caixa de entrada está vazia"}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {emails.map((email) => (
                  <EmailListItem key={email.id} email={email} folder="inbox" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
