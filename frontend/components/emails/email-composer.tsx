"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Paperclip, Send, Save, AlertCircle } from "lucide-react"
import { emailsService } from "@/lib/emails"
import { emailValidation } from "@/lib/validation"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { EnviarEmailRequest, EmailTemplate } from "@/lib/types"
import { TemplateSelector } from "./template-selector"

interface EmailComposerProps {
  replyTo?: {
    id: number
    subject: string
    to: string
    body: string
  }
  defaultTo?: string
  defaultSubject?: string
}

export function EmailComposer({ replyTo, defaultTo, defaultSubject }: EmailComposerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [sending, setSending] = useState(false)
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [para, setPara] = useState(defaultTo || replyTo?.to || "")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [assunto, setAssunto] = useState(defaultSubject || (replyTo ? `Re: ${replyTo.subject}` : ""))
  const [corpo, setCorpo] = useState(
    replyTo
      ? `\n\n---\nEm resposta a:\n${replyTo.body.split("\n").slice(0, 3).join("\n")}${replyTo.body.split("\n").length > 3 ? "..." : ""}`
      : "",
  )
  const [anexos, setAnexos] = useState<File[]>([])
  const [replyToId, setReplyToId] = useState<number | undefined>(replyTo?.id)

  useEffect(() => {
    const loadEmailData = async () => {
      const replyId = searchParams.get("reply")
      const forwardId = searchParams.get("forward")

      if (replyId) {
        try {
          const email = await emailsService.getById(Number.parseInt(replyId))
          setPara(email.remetente)
          setAssunto(`Re: ${email.assunto}`)
          setCorpo(
            `\n\n---\nEm ${new Date(email.criado_em).toLocaleString("pt-BR")}, ${email.remetente} escreveu:\n\n${email.corpo}`,
          )
          setReplyToId(email.id)
        } catch (error) {
          console.error("[v0] Error loading email for reply:", error)
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar o email",
          })
        }
      } else if (forwardId) {
        try {
          const email = await emailsService.getById(Number.parseInt(forwardId))
          setAssunto(`Fwd: ${email.assunto}`)
          setCorpo(
            `\n\n---\nMensagem encaminhada\nDe: ${email.remetente}\nData: ${new Date(email.criado_em).toLocaleString("pt-BR")}\nAssunto: ${email.assunto}\n\n${email.corpo}`,
          )
        } catch (error) {
          console.error("[v0] Error loading email for forward:", error)
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar o email",
          })
        }
      }

      setLoading(false)
    }

    loadEmailData()
  }, [searchParams, toast])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)

    // Validate individual file sizes
    for (const file of files) {
      const validation = emailValidation.validateAttachmentSize(file)
      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: validation.error,
        })
        e.target.value = ""
        return
      }
    }

    // Validate total size
    const allFiles = [...anexos, ...files]
    const totalValidation = emailValidation.validateTotalAttachmentsSize(allFiles)
    if (!totalValidation.valid) {
      toast({
        variant: "destructive",
        title: "Limite excedido",
        description: totalValidation.error,
      })
      e.target.value = ""
      return
    }

    setUploading(true)

    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/attachments/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`)
          }

          return response.json()
        }),
      )

      console.log("[v0] Files uploaded successfully:", uploadedFiles)

      setAnexos([...anexos, ...files])
      toast({
        title: "Anexos adicionados",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      })
    } catch (error) {
      console.error("[v0] Error uploading files:", error)
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível fazer upload dos anexos",
      })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index))
    toast({
      title: "Anexo removido",
    })
  }

  const handleSend = async () => {
    // Validate form
    const validation = emailValidation.validateEmailComposer({
      para,
      cc,
      bcc,
      assunto,
      corpo,
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      toast({
        variant: "destructive",
        title: "Validação falhou",
        description: validation.errors[0],
      })
      return
    }

    setErrors([])

    try {
      setSending(true)

      const emailData: EnviarEmailRequest = {
        para: para.split(",").map((e) => e.trim()),
        cc: cc ? cc.split(",").map((e) => e.trim()) : undefined,
        bcc: bcc ? bcc.split(",").map((e) => e.trim()) : undefined,
        assunto,
        corpo,
        em_resposta_a: replyToId,
        anexos: anexos.length > 0 ? anexos : undefined,
      }

      await emailsService.send(emailData)

      toast({
        title: "Email enviado",
        description: "Seu email foi enviado com sucesso",
      })

      setTimeout(() => {
        router.push("/sent")
      }, 1000)
    } catch (error) {
      console.error("[v0] Erro ao enviar email:", error)
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Não foi possível enviar o email. Tente novamente.",
      })
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      await emailsService.saveDraft({
        para: para.split(",").map((e) => e.trim()),
        cc: cc ? cc.split(",").map((e) => e.trim()) : undefined,
        bcc: bcc ? bcc.split(",").map((e) => e.trim()) : undefined,
        assunto: assunto || undefined,
        corpo: corpo || undefined,
      })

      toast({
        title: "Rascunho salvo",
        description: "Seu rascunho foi salvo com sucesso",
      })

      setTimeout(() => {
        router.push("/drafts")
      }, 1000)
    } catch (error) {
      console.error("[v0] Erro ao salvar rascunho:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o rascunho",
      })
    }
  }

  const handleSelectTemplate = (template: EmailTemplate) => {
    setAssunto(template.assunto)
    setCorpo(template.corpo)
    toast({
      title: "Template aplicado",
      description: template.nome,
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {replyToId ? "Responder Email" : searchParams.get("forward") ? "Encaminhar Email" : "Novo Email"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="para" className="w-16">
              {"Para:"}
            </Label>
            <Input
              id="para"
              type="email"
              placeholder="destinatario@example.com"
              value={para}
              onChange={(e) => {
                setPara(e.target.value)
                setErrors([])
              }}
              className="flex-1"
              disabled={sending}
            />
            {!showCc && (
              <Button variant="ghost" size="sm" onClick={() => setShowCc(true)} disabled={sending}>
                {"Cc"}
              </Button>
            )}
            {!showBcc && (
              <Button variant="ghost" size="sm" onClick={() => setShowBcc(true)} disabled={sending}>
                {"Bcc"}
              </Button>
            )}
          </div>

          {showCc && (
            <div className="flex items-center gap-2">
              <Label htmlFor="cc" className="w-16">
                {"Cc:"}
              </Label>
              <Input
                id="cc"
                type="email"
                placeholder="com_copia@example.com"
                value={cc}
                onChange={(e) => {
                  setCc(e.target.value)
                  setErrors([])
                }}
                className="flex-1"
                disabled={sending}
              />
              <Button variant="ghost" size="sm" onClick={() => setShowCc(false)} disabled={sending}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showBcc && (
            <div className="flex items-center gap-2">
              <Label htmlFor="bcc" className="w-16">
                {"Bcc:"}
              </Label>
              <Input
                id="bcc"
                type="email"
                placeholder="copia_oculta@example.com"
                value={bcc}
                onChange={(e) => {
                  setBcc(e.target.value)
                  setErrors([])
                }}
                className="flex-1"
                disabled={sending}
              />
              <Button variant="ghost" size="sm" onClick={() => setShowBcc(false)} disabled={sending}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="assunto" className="w-16">
              {"Assunto:"}
            </Label>
            <Input
              id="assunto"
              type="text"
              placeholder="Assunto do email"
              value={assunto}
              onChange={(e) => {
                setAssunto(e.target.value)
                setErrors([])
              }}
              className="flex-1"
              disabled={sending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={corpo}
            onChange={(e) => {
              setCorpo(e.target.value)
              setErrors([])
            }}
            className="min-h-[300px] resize-y"
            disabled={sending}
          />
        </div>

        {anexos.length > 0 && (
          <div className="space-y-2">
            <Label>{"Anexos:"}</Label>
            <div className="space-y-1">
              {anexos.map((file, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)}
                    {" KB"}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => removeAnexo(index)} disabled={sending}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sending || uploading} className="gap-2">
              {sending ? (
                <>
                  <LoadingSpinner size="sm" className="text-primary-foreground" />
                  {"Enviando..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {"Enviar"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={uploading || sending}
              className="gap-2 bg-transparent"
            >
              <Save className="h-4 w-4" />
              {"Salvar Rascunho"}
            </Button>

            <TemplateSelector onSelectTemplate={handleSelectTemplate} />

            <label htmlFor="file-upload">
              <Button variant="outline" type="button" asChild disabled={uploading || sending}>
                <span className="gap-2">
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      {"Enviando..."}
                    </>
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4" />
                      {"Anexar"}
                    </>
                  )}
                </span>
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="*/*"
                disabled={uploading || sending}
              />
            </label>
          </div>

          <Button variant="ghost" onClick={() => router.back()} disabled={sending}>
            {"Cancelar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
