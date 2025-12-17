"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText } from "lucide-react"
import { templatesService } from "@/lib/templates"
import type { EmailTemplate } from "@/lib/types"

interface TemplateSelectorProps {
  onSelectTemplate: (template: EmailTemplate) => void
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await templatesService.getAll()
      setTemplates(data)
    } catch (error) {
      console.error("[v0] Error loading templates:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} className="gap-2 bg-transparent">
          <FileText className="h-4 w-4" />
          {loading ? "Carregando..." : "Templates"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Selecione um template</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.length === 0 ? (
          <div className="p-2 text-sm text-center text-muted-foreground">Nenhum template disponível</div>
        ) : (
          templates.map((template) => (
            <DropdownMenuItem key={template.id} onClick={() => onSelectTemplate(template)} className="cursor-pointer">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{template.nome}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">{template.assunto}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
