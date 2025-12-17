"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [sesConfigured, setSesConfigured] = useState(false)
  const [checkingSES, setCheckingSES] = useState(false)

  useEffect(() => {
    checkSESStatus()
  }, [])

  const checkSESStatus = async () => {
    setCheckingSES(true)
    try {
      const response = await fetch("/api/ses/status")
      const data = await response.json()
      setSesConfigured(data.configured)
    } catch (error) {
      console.error("[v0] Erro ao verificar status SES:", error)
      setSesConfigured(false)
    } finally {
      setCheckingSES(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Configurações" description="Gerencie suas preferências e configurações" />

      <div className="flex-1 space-y-6 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{"Configuração AWS SES"}</CardTitle>
                  <CardDescription>{"Configure o envio e recebimento de emails via Amazon SES"}</CardDescription>
                </div>
                {checkingSES ? (
                  <Badge variant="outline">{"Verificando..."}</Badge>
                ) : sesConfigured ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {"Configurado"}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    {"Não Configurado"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!sesConfigured && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        {"SES não está configurado"}
                      </p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
                        {
                          "Os emails estão sendo salvos apenas no banco de dados. Configure o AWS SES para enviar e receber emails reais."
                        }
                      </p>
                      <a
                        href="https://github.com/tomasbalestrin-brius/gestao-de-emails/blob/main/CONFIGURAR_SES.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-900 hover:underline dark:text-amber-100"
                      >
                        {"Ver guia de configuração completo"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-medium">{"Variáveis de Ambiente Necessárias"}</h4>
                <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                  <div className="font-mono text-xs">
                    <div className="text-muted-foreground">{"# AWS Credentials"}</div>
                    <div>{"AWS_ACCESS_KEY_ID=your-access-key"}</div>
                    <div>{"AWS_SECRET_ACCESS_KEY=your-secret-key"}</div>
                    <div>{"AWS_REGION=us-east-1"}</div>
                    <div className="mt-2 text-muted-foreground">{"# SES Configuration"}</div>
                    <div>{"SES_FROM_EMAIL=suporte@seudominio.com"}</div>
                    <div>{"SES_FROM_NAME=Equipe de Suporte"}</div>
                    <div>{"SES_IDENTITY_ARN=arn:aws:ses:..."}</div>
                  </div>
                </div>

                <h4 className="text-sm font-medium">{"Passos para Configurar"}</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium">{"1."}</span>
                    <span>{"Verifique sua identidade de email ou domínio no AWS SES Console"}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">{"2."}</span>
                    <span>{"Adicione as variáveis de ambiente no seu projeto Vercel"}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">{"3."}</span>
                    <span>{"Configure o recebimento de emails criando um SNS Topic e Rule Set"}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">{"4."}</span>
                    <span>{"Adicione os registros DNS necessários (MX, DKIM, SPF)"}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">{"5."}</span>
                    <span>{"Solicite saída do sandbox mode para enviar para qualquer email"}</span>
                  </li>
                </ol>

                <Button onClick={checkSESStatus} variant="outline" disabled={checkingSES}>
                  {checkingSES ? "Verificando..." : "Verificar Configuração"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{"Assinatura de Email"}</CardTitle>
              <CardDescription>{"Assinatura que aparecerá no final dos seus emails"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assinatura">{"Assinatura"}</Label>
                <Textarea
                  id="assinatura"
                  placeholder="Atenciosamente,&#10;Sua Equipe de Suporte"
                  className="min-h-[100px]"
                  defaultValue={`Atenciosamente,\n${user?.nome}\nEquipe de Suporte`}
                />
              </div>

              <Button>{"Salvar Assinatura"}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{"Perfil"}</CardTitle>
              <CardDescription>{"Informações da sua conta"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">{"Nome"}</Label>
                <Input id="nome" defaultValue={user?.nome} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{"Email"}</Label>
                <Input id="email" type="email" defaultValue={user?.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{"Função"}</Label>
                <Input id="role" defaultValue={user?.papel === "admin" ? "Administrador" : "Agente"} disabled />
              </div>

              <Button>{"Salvar Alterações"}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{"Alterar Senha"}</CardTitle>
              <CardDescription>{"Atualize sua senha de acesso"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha-atual">{"Senha Atual"}</Label>
                <Input id="senha-atual" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nova-senha">{"Nova Senha"}</Label>
                <Input id="nova-senha" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">{"Confirmar Nova Senha"}</Label>
                <Input id="confirmar-senha" type="password" />
              </div>

              <Button>{"Alterar Senha"}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{"Notificações"}</CardTitle>
              <CardDescription>{"Configure suas preferências de notificação"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Novos Emails"}</p>
                  <p className="text-sm text-muted-foreground">{"Receber notificação quando um novo email chegar"}</p>
                </div>
                <Button variant="outline" size="sm">
                  {"Ativado"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Respostas"}</p>
                  <p className="text-sm text-muted-foreground">
                    {"Receber notificação quando alguém responder seus emails"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {"Ativado"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{"Emails Importantes"}</p>
                  <p className="text-sm text-muted-foreground">
                    {"Receber notificação para emails marcados como importantes"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {"Ativado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
