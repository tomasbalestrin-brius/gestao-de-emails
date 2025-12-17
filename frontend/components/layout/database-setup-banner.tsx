"use client"

import { AlertTriangle, ExternalLink, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { hasSupabaseIntegration } from "@/lib/api"

interface DatabaseSetupBannerProps {
  show: boolean
}

export function DatabaseSetupBanner({ show }: DatabaseSetupBannerProps) {
  const [copied, setCopied] = useState(false)

  if (!show || !hasSupabaseIntegration) return null

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(
        "Execute o script SQL localizado em: scripts/001_cleanup_and_recreate.sql no Supabase SQL Editor",
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Alert className="border-orange-500 bg-orange-500/10 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertTitle className="text-orange-500">Banco de Dados Não Configurado</AlertTitle>
      <AlertDescription className="text-orange-500/90">
        <div className="space-y-3">
          <p>
            As tabelas do banco de dados ainda não foram criadas no Supabase. Siga os passos abaixo para configurar:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Abra o{" "}
              <Button variant="link" size="sm" className="text-orange-500 underline h-auto p-0" asChild>
                <a
                  href="https://vgzylypzrudzrhueoros.supabase.co/project/_/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase SQL Editor
                  <ExternalLink className="ml-1 h-3 w-3 inline" />
                </a>
              </Button>
            </li>
            <li>
              Copie o conteúdo do arquivo{" "}
              <code className="bg-orange-500/20 px-1 py-0.5 rounded">scripts/001_cleanup_and_recreate.sql</code>
            </li>
            <li>
              Cole no SQL Editor e clique em <strong>Run</strong>
            </li>
            <li>Recarregue esta página após a execução bem-sucedida</li>
          </ol>

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-500 bg-transparent"
              onClick={handleCopyScript}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  {"Copiado!"}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3 w-3" />
                  {"Copiar Lembrete"}
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 bg-transparent" asChild>
              <a
                href="https://vgzylypzrudzrhueoros.supabase.co/project/_/sql"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir SQL Editor
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
