"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, parseISO, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  Mail,
  MailOpen,
  Paperclip,
  Download,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { emailsService } from "@/lib/emails"
import type { EmailMessage } from "@/lib/types"
import { AttachmentPreview } from "./attachment-preview"

interface EmailViewerProps {
  email: EmailMessage
  folder: string
  onUpdate?: () => void
}

export function EmailViewer({ email, folder, onUpdate }: EmailViewerProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  const handleMarkAsRead = async () => {
    try {
      setProcessing(true)
      await emailsService.markAsRead(email.id, !email.lido)
      onUpdate?.()
    } catch (error) {
      console.error("[v0] Error marking as read:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkAsImportant = async () => {
    try {
      setProcessing(true)
      await emailsService.markAsImportant(email.id, !email.importante)
      onUpdate?.()
    } catch (error) {
      console.error("[v0] Error marking as important:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleArchive = async () => {
    try {
      setProcessing(true)
      await emailsService.moveToFolder(email.id, "archived")
      router.push("/inbox")
    } catch (error) {
      console.error("[v0] Error archiving:", error)
      alert("Erro ao arquivar email")
    } finally {
      setProcessing(false)
    }
  }

  const handleTrash = async () => {
    try {
      setProcessing(true)
      await emailsService.moveToFolder(email.id, "trash")
      router.push("/inbox")
    } catch (error) {
      console.error("[v0] Error moving to trash:", error)
      alert("Erro ao mover para lixeira")
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkAsSpam = async () => {
    try {
      setProcessing(true)
      await emailsService.markAsSpam(email.id)
      router.push("/inbox")
    } catch (error) {
      console.error("[v0] Error marking as spam:", error)
      alert("Erro ao marcar como spam")
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkAsNotSpam = async () => {
    try {
      setProcessing(true)
      await emailsService.markAsNotSpam(email.id)
      router.push("/inbox")
    } catch (error) {
      console.error("[v0] Error marking as not spam:", error)
      alert("Erro ao remover de spam")
    } finally {
      setProcessing(false)
    }
  }

  const handleReply = () => {
    router.push(`/compose?reply=${email.id}`)
  }

  const handleForward = () => {
    router.push(`/compose?forward=${email.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {"Voltar"}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReply}
            disabled={processing}
            className="gap-2 bg-transparent"
          >
            <Reply className="h-4 w-4" />
            {"Responder"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleForward}
            disabled={processing}
            className="gap-2 bg-transparent"
          >
            <Forward className="h-4 w-4" />
            {"Encaminhar"}
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsRead}
            disabled={processing}
            title={email.lido ? "Marcar como não lido" : "Marcar como lido"}
          >
            {email.lido ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsImportant}
            disabled={processing}
            title={email.importante ? "Remover dos importantes" : "Marcar como importante"}
          >
            <Star className={`h-4 w-4 ${email.importante ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </Button>

          {folder !== "archived" && (
            <Button variant="ghost" size="sm" onClick={handleArchive} disabled={processing} title="Arquivar">
              <Archive className="h-4 w-4" />
            </Button>
          )}

          {folder === "spam" ? (
            <Button variant="ghost" size="sm" onClick={handleMarkAsNotSpam} disabled={processing} title="Não é spam">
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </Button>
          ) : (
            folder !== "trash" &&
            folder !== "sent" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsSpam}
                disabled={processing}
                title="Marcar como spam"
              >
                <ShieldAlert className="h-4 w-4" />
              </Button>
            )
          )}

          {folder !== "trash" && (
            <Button variant="ghost" size="sm" onClick={handleTrash} disabled={processing} title="Mover para lixeira">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {folder === "spam" && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Este email foi marcado como spam
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Tenha cuidado ao abrir links ou anexos de emails suspeitos
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsNotSpam}
              disabled={processing}
              className="gap-2 bg-transparent"
            >
              <ShieldCheck className="h-4 w-4" />
              {"Não é spam"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">{email.assunto || "(Sem assunto)"}</h1>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {email.remetente.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{email.remetente}</p>
                  <p className="text-sm text-muted-foreground">
                    {"Para: "}
                    {email.destinatarios.join(", ")}
                  </p>
                  {email.cc && email.cc.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {"Cc: "}
                      {email.cc.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right text-sm text-muted-foreground">
              <p>{format(parseISO(email.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              <p>{formatDistanceToNow(parseISO(email.criado_em), { addSuffix: true, locale: ptBR })}</p>
            </div>
          </div>

          <Separator />

          <div className="prose prose-sm max-w-none">
            {email.html ? (
              <div dangerouslySetInnerHTML={{ __html: email.html }} />
            ) : (
              <div className="whitespace-pre-wrap">{email.corpo}</div>
            )}
          </div>

          {email.anexos && email.anexos.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm font-medium">
                  {"Anexos ("}
                  {email.anexos.length}
                  {")"}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {email.anexos.map((anexo) => (
                    <div key={anexo.id} className="group relative">
                      <a
                        href={anexo.url}
                        download={anexo.nome_arquivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <AttachmentPreview
                          fileName={anexo.nome_arquivo}
                          fileType={anexo.tipo_conteudo}
                          url={anexo.url}
                        />
                      </a>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <a href={anexo.url} download={anexo.nome_arquivo}>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {email.anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center gap-2 rounded-md border p-3">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{anexo.nome_arquivo}</p>
                        <p className="text-xs text-muted-foreground">
                          {(anexo.tamanho / 1024).toFixed(1)}
                          {" KB"} • {anexo.tipo_conteudo}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={anexo.url} download={anexo.nome_arquivo}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
