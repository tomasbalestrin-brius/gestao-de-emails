"use client"

import { AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { isApiMockMode } from "@/lib/api"
import { useState } from "react"

export function MockModeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isApiMockMode || !isVisible) return null

  return (
    <Alert className="border-amber-500 bg-amber-500/10 mb-4">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">Modo de Demonstração</AlertTitle>
      <AlertDescription className="text-amber-500/90">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            O sistema está usando dados simulados. Para conectar ao backend real do GitHub
            (tomasbalestrin-brius/gestao-de-emails), configure a variável de ambiente{" "}
            <code className="bg-amber-500/20 px-1 py-0.5 rounded">NEXT_PUBLIC_API_URL</code> para apontar ao seu
            servidor Node.js/Fastify.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-amber-500 text-amber-500 bg-transparent" asChild>
              <a
                href="https://github.com/tomasbalestrin-brius/gestao-de-emails"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Backend
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              Entendi
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
