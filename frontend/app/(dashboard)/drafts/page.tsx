"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PenSquare, Trash2 } from "lucide-react"
import { emailsService } from "@/lib/emails"
import type { Rascunho } from "@/lib/types"
import { formatDistanceToNow, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Rascunho[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDrafts()
  }, [])

  const loadDrafts = async () => {
    try {
      setLoading(true)
      const data = await emailsService.getDrafts()
      setDrafts(data)
    } catch (error) {
      console.error("[v0] Error loading drafts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este rascunho?")) return

    try {
      await emailsService.deleteDraft(id)
      loadDrafts()
    } catch (error) {
      console.error("[v0] Error deleting draft:", error)
      alert("Erro ao excluir rascunho")
    }
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Rascunhos"
        description="Emails salvos como rascunho"
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
            <div className="text-muted-foreground">{"Carregando rascunhos..."}</div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">{"Nenhum rascunho salvo"}</p>
            <p className="text-sm text-muted-foreground">{"Comece a escrever um email e salve como rascunho"}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {drafts.map((draft) => (
              <Card key={draft.id} className="hover:bg-accent">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{draft.assunto || "(Sem assunto)"}</p>
                      <p className="text-sm text-muted-foreground">{"Para: " + draft.para.join(", ")}</p>
                      {draft.corpo && (
                        <p className="text-sm text-muted-foreground">
                          {draft.corpo.substring(0, 100)}
                          {draft.corpo.length > 100 ? "..." : ""}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {"Salvo " +
                          formatDistanceToNow(parseISO(draft.atualizado_em), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/compose?draft=${draft.id}`)}>
                        {"Editar"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(draft.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
