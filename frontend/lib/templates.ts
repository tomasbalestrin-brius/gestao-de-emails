import api, { isApiMockMode, hasSupabaseIntegration } from "./api"
import type { EmailTemplate } from "./types"
import { getSupabaseBrowserClient } from "./supabase"

const MOCK_MODE = isApiMockMode

const mockTemplates: EmailTemplate[] = [
  {
    id: 1,
    usuario_id: 1,
    nome: "Boas-vindas",
    assunto: "Bem-vindo!",
    corpo:
      "Olá,\n\nSeja bem-vindo ao nosso sistema!\n\nEstamos felizes em tê-lo conosco.\n\nAtenciosamente,\nEquipe de Suporte",
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 2,
    usuario_id: 1,
    nome: "Resposta padrão",
    assunto: "Re: Sua solicitação",
    corpo:
      "Olá,\n\nObrigado por entrar em contato.\n\nRecebemos sua mensagem e retornaremos em breve.\n\nAtenciosamente,\nEquipe de Suporte",
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 3,
    usuario_id: 1,
    nome: "Ticket resolvido",
    assunto: "Ticket resolvido",
    corpo:
      "Olá,\n\nSeu ticket foi resolvido com sucesso.\n\nSe precisar de mais ajuda, não hesite em nos contatar novamente.\n\nAtenciosamente,\nEquipe de Suporte",
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  },
]

export const templatesService = {
  async getAll(): Promise<EmailTemplate[]> {
    console.log("[v0] templatesService.getAll chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockTemplates
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("email_templates").select("*").order("nome", { ascending: true })

        if (error) throw error
        return data || []
      } catch (error: any) {
        console.error("[v0] Erro ao buscar templates:", error.message)
        return []
      }
    }

    const { data } = await api.get<EmailTemplate[]>("/templates")
    return data
  },

  async getById(id: number): Promise<EmailTemplate> {
    console.log("[v0] templatesService.getById chamado, id:", id, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const template = mockTemplates.find((t) => t.id === id)
      if (!template) throw new Error("Template não encontrado")
      return template
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("email_templates").select("*").eq("id", id).single()

        if (error) throw error
        return data
      } catch (error: any) {
        console.error("[v0] Erro ao buscar template:", error.message)
        throw error
      }
    }

    const { data } = await api.get<EmailTemplate>(`/templates/${id}`)
    return data
  },

  async create(template: Omit<EmailTemplate, "id" | "criado_em" | "atualizado_em">): Promise<EmailTemplate> {
    console.log("[v0] templatesService.create chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newTemplate: EmailTemplate = {
        ...template,
        id: Date.now(),
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      }
      mockTemplates.push(newTemplate)
      return newTemplate
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("email_templates")
          .insert({
            ...template,
            usuario_id: template.usuario_id || 1, // TODO: Get from auth context
          })
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error: any) {
        console.error("[v0] Erro ao criar template:", error.message)
        throw error
      }
    }

    const { data } = await api.post<EmailTemplate>("/templates", template)
    return data
  },

  async update(id: number, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    console.log("[v0] templatesService.update chamado, id:", id, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const index = mockTemplates.findIndex((t) => t.id === id)
      if (index === -1) throw new Error("Template não encontrado")

      mockTemplates[index] = {
        ...mockTemplates[index],
        ...template,
        atualizado_em: new Date().toISOString(),
      }
      return mockTemplates[index]
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("email_templates")
          .update({
            ...template,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error: any) {
        console.error("[v0] Erro ao atualizar template:", error.message)
        throw error
      }
    }

    const { data } = await api.put<EmailTemplate>(`/templates/${id}`, template)
    return data
  },

  async delete(id: number): Promise<void> {
    console.log("[v0] templatesService.delete chamado, id:", id, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const index = mockTemplates.findIndex((t) => t.id === id)
      if (index !== -1) {
        mockTemplates.splice(index, 1)
      }
      return
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { error } = await supabase.from("email_templates").delete().eq("id", id)

        if (error) throw error
      } catch (error: any) {
        console.error("[v0] Erro ao deletar template:", error.message)
        throw error
      }
      return
    }

    await api.delete(`/templates/${id}`)
  },
}
