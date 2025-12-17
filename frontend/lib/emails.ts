import api, { isApiMockMode, hasSupabaseIntegration } from "./api"
import type { EmailMessage, EmailStats, EnviarEmailRequest, Rascunho } from "./types"
import { getSupabaseBrowserClient } from "./supabase"

const MOCK_MODE = isApiMockMode

const mockEmails: EmailMessage[] = [
  {
    id: 1,
    thread_id: 1,
    remetente: "cliente1@example.com",
    destinatarios: ["suporte@example.com"],
    assunto: "Problema com login no sistema",
    corpo: "Olá, não consigo fazer login no sistema. Já tentei recuperar a senha mas não funcionou.",
    pasta: "inbox",
    lido: false,
    importante: false,
    tipo: "recebido",
    criado_em: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    thread_id: 2,
    remetente: "cliente2@example.com",
    destinatarios: ["suporte@example.com"],
    assunto: "Dúvida sobre funcionalidade",
    corpo: "Como faço para exportar os relatórios em formato PDF?",
    pasta: "inbox",
    lido: true,
    importante: false,
    tipo: "recebido",
    criado_em: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    thread_id: 2,
    remetente: "suporte@example.com",
    destinatarios: ["cliente2@example.com"],
    assunto: "Re: Dúvida sobre funcionalidade",
    corpo:
      "Olá Maria! Para exportar em PDF, basta clicar no botão de exportar no canto superior direito da tela de relatórios.",
    pasta: "sent",
    lido: true,
    importante: false,
    tipo: "enviado",
    em_resposta_a: 2,
    criado_em: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    thread_id: 3,
    remetente: "newsletter@tech.com",
    destinatarios: ["suporte@example.com"],
    assunto: "Novidades da semana em tecnologia",
    corpo: "Confira as últimas notícias do mundo tech!",
    pasta: "inbox",
    lido: false,
    importante: false,
    tipo: "recebido",
    criado_em: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const emailsService = {
  async getByFolder(pasta = "inbox"): Promise<EmailMessage[]> {
    console.log("[v0] emailsService.getByFolder chamado, pasta:", pasta, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const filtered = mockEmails.filter((e) => e.pasta === pasta)
      console.log("[v0] Retornando", filtered.length, "emails mock da pasta", pasta)
      return filtered
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()

        let query = supabase.from("emails").select("*").order("criado_em", { ascending: false })

        // Tenta usar a coluna pasta primeiro
        try {
          const testQuery = await supabase.from("emails").select("pasta").limit(1)

          // Se a coluna pasta existe, usa ela
          if (!testQuery.error) {
            query = query.eq("pasta", pasta)
          } else {
            // Fallback: usa coluna tipo (recebido = inbox, enviado = sent)
            console.log("[v0] Coluna 'pasta' não existe, usando fallback com coluna 'tipo'")
            if (pasta === "inbox") {
              query = query.eq("tipo", "recebido")
            } else if (pasta === "sent") {
              query = query.eq("tipo", "enviado")
            } else {
              // Para outras pastas, retorna vazio
              return []
            }
          }
        } catch (e) {
          // Se houve erro na verificação, usa fallback
          console.log("[v0] Erro ao verificar coluna, usando fallback")
          if (pasta === "inbox") {
            query = query.eq("tipo", "recebido")
          } else if (pasta === "sent") {
            query = query.eq("tipo", "enviado")
          } else {
            return []
          }
        }

        const { data, error } = await query

        if (error) {
          console.error("[v0] Erro ao buscar emails:", error.message)
          return []
        }

        const emailsComAnexos = await Promise.all(
          (data || []).map(async (e) => {
            const { data: anexosData } = await supabase.from("anexos").select("*").eq("email_id", e.id)

            return {
              ...e,
              pasta: e.pasta || (e.tipo === "recebido" ? "inbox" : "sent"),
              lido: e.lido !== undefined ? e.lido : false,
              importante: e.importante !== undefined ? e.importante : false,
              thread_id: e.thread_id || e.ticket_id,
              anexos: anexosData || [],
            }
          }),
        )

        console.log("[v0] Emails retornados do Supabase:", emailsComAnexos.length)
        return emailsComAnexos
      } catch (error: any) {
        console.error("[v0] Erro ao buscar emails:", error.message)
        return []
      }
    }

    const { data } = await api.get<EmailMessage[]>("/emails", { params: { pasta } })
    return data
  },

  async getById(id: number): Promise<EmailMessage> {
    console.log("[v0] emailsService.getById chamado, id:", id, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const email = mockEmails.find((e) => e.id === id)
      if (!email) throw new Error("Email não encontrado")
      return email
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()

        const { data: emailData, error } = await supabase.from("emails").select("*").eq("id", id).single()

        if (error) throw error

        const { data: anexosData } = await supabase.from("anexos").select("*").eq("email_id", id)

        return {
          ...emailData,
          anexos: anexosData || [],
        }
      } catch (error: any) {
        console.error("[v0] Erro ao buscar email:", error.message)
        throw error
      }
    }

    const { data } = await api.get<EmailMessage>(`/emails/${id}`)
    return data
  },

  async getThread(threadId: number): Promise<EmailMessage[]> {
    console.log("[v0] emailsService.getThread chamado, threadId:", threadId, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const thread = mockEmails.filter((e) => e.thread_id === threadId)
      return thread.sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()

        const { data, error } = await supabase
          .from("emails")
          .select("*")
          .eq("thread_id", threadId)
          .order("criado_em", { ascending: true })

        if (error) throw error

        return data || []
      } catch (error: any) {
        console.error("[v0] Erro ao buscar thread:", error.message)
        return []
      }
    }

    const { data } = await api.get<EmailMessage[]>(`/emails/thread/${threadId}`)
    return data
  },

  async send(emailData: EnviarEmailRequest): Promise<EmailMessage> {
    console.log("[v0] emailsService.send chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const newEmail: EmailMessage = {
        id: Date.now(),
        thread_id: emailData.em_resposta_a
          ? mockEmails.find((e) => e.id === emailData.em_resposta_a)?.thread_id
          : Date.now(),
        em_resposta_a: emailData.em_resposta_a,
        remetente: "suporte@example.com",
        destinatarios: emailData.para,
        cc: emailData.cc,
        bcc: emailData.bcc,
        assunto: emailData.assunto,
        corpo: emailData.corpo,
        html: emailData.html,
        pasta: "sent",
        lido: true,
        importante: false,
        tipo: "enviado",
        criado_em: new Date().toISOString(),
      }
      mockEmails.push(newEmail)
      return newEmail
    }

    // Using new API route for SES integration
    try {
      const response = await api.post<{
        success: boolean
        email: EmailMessage
        sentViaSES: boolean
        messageId?: string
      }>("/api/emails/send", emailData)

      const { data } = response

      if (data.sentViaSES) {
        console.log("[v0] Email enviado via SES com sucesso, MessageId:", data.messageId)
      } else {
        console.log("[v0] Email salvo no banco (SES não configurado)")
      }

      return data.email
    } catch (error: any) {
      console.error("[v0] Erro ao enviar email:", error)
      throw error
    }
  },

  async markAsRead(id: number, lido = true): Promise<void> {
    console.log("[v0] emailsService.markAsRead chamado, id:", id, "lido:", lido, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const email = mockEmails.find((e) => e.id === id)
      if (email) email.lido = lido
      return
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("emails").update({ lido }).eq("id", id)
      if (error) throw error
      return
    }

    await api.patch(`/emails/${id}`, { lido })
  },

  async markAsImportant(id: number, importante = true): Promise<void> {
    console.log("[v0] emailsService.markAsImportant chamado, id:", id, "importante:", importante, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const email = mockEmails.find((e) => e.id === id)
      if (email) email.importante = importante
      return
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("emails").update({ importante }).eq("id", id)
      if (error) throw error
      return
    }

    await api.patch(`/emails/${id}`, { importante })
  },

  async moveToFolder(id: number, pasta: string): Promise<void> {
    console.log("[v0] emailsService.moveToFolder chamado, id:", id, "pasta:", pasta, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const email = mockEmails.find((e) => e.id === id)
      if (email) email.pasta = pasta as any
      return
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("emails").update({ pasta }).eq("id", id)
      if (error) throw error
      return
    }

    await api.patch(`/emails/${id}`, { pasta })
  },

  async markAsSpam(id: number): Promise<void> {
    console.log("[v0] emailsService.markAsSpam chamado, id:", id, "mock:", MOCK_MODE)
    await this.moveToFolder(id, "spam")
  },

  async markAsNotSpam(id: number): Promise<void> {
    console.log("[v0] emailsService.markAsNotSpam chamado, id:", id, "mock:", MOCK_MODE)
    await this.moveToFolder(id, "inbox")
  },

  async getStats(): Promise<EmailStats> {
    console.log("[v0] emailsService.getStats chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const stats = {
        total: mockEmails.filter((e) => e.pasta === "inbox").length,
        nao_lidos: mockEmails.filter((e) => e.pasta === "inbox" && !e.lido).length,
        importantes: mockEmails.filter((e) => e.importante).length,
        hoje: mockEmails.filter((e) => {
          const hoje = new Date().toDateString()
          return new Date(e.criado_em).toDateString() === hoje
        }).length,
      }
      return stats
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()

        let data: any
        try {
          const result = await supabase.from("emails").select("pasta, lido, importante, criado_em")

          if (result.error) throw result.error

          data = result.data
        } catch (e) {
          // Fallback: usa coluna tipo
          console.log("[v0] Usando fallback para estatísticas")
          const result = await supabase.from("emails").select("tipo, criado_em")

          if (result.error) throw result.error

          const allEmails = result.data || []
          const hoje = new Date().toDateString()

          return {
            total: allEmails.filter((e: any) => e.tipo === "recebido").length,
            nao_lidos: allEmails.filter((e: any) => e.tipo === "recebido").length,
            importantes: 0,
            hoje: allEmails.filter((e: any) => new Date(e.criado_em).toDateString() === hoje).length,
          }
        }

        if (!data) {
          return { total: 0, nao_lidos: 0, importantes: 0, hoje: 0 }
        }

        const hoje = new Date().toDateString()

        return {
          total: data.filter((e: any) => (e.pasta || e.tipo === "recebido") === "inbox").length,
          nao_lidos: data.filter((e: any) => (e.pasta || e.tipo === "recebido") === "inbox" && !e.lido).length,
          importantes: data.filter((e: any) => e.importante).length,
          hoje: data.filter((e: any) => new Date(e.criado_em).toDateString() === hoje).length,
        }
      } catch (error: any) {
        console.error("[v0] Erro ao buscar estatísticas:", error.message)
        return { total: 0, nao_lidos: 0, importantes: 0, hoje: 0 }
      }
    }

    const { data } = await api.get<EmailStats>("/emails/stats")
    return data
  },

  // Gerenciamento de rascunhos
  async saveDraft(rascunho: Partial<Rascunho>): Promise<Rascunho> {
    console.log("[v0] emailsService.saveDraft chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return {
        id: Date.now(),
        usuario_id: 1,
        para: rascunho.para || [],
        cc: rascunho.cc,
        bcc: rascunho.bcc,
        assunto: rascunho.assunto,
        corpo: rascunho.corpo,
        html: rascunho.html,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      }
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      if (rascunho.id) {
        const { data, error } = await supabase
          .from("rascunhos")
          .update(rascunho)
          .eq("id", rascunho.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from("rascunhos")
          .insert({
            ...rascunho,
            usuario_id: 1, // TODO: Pegar do contexto de autenticação
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    }

    const { data } = await api.post<Rascunho>("/emails/drafts", rascunho)
    return data
  },

  async getDrafts(): Promise<Rascunho[]> {
    console.log("[v0] emailsService.getDrafts chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return []
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("rascunhos").select("*").order("atualizado_em", { ascending: false })

      if (error) throw error
      return data || []
    }

    const { data } = await api.get<Rascunho[]>("/emails/drafts")
    return data
  },

  async deleteDraft(id: number): Promise<void> {
    console.log("[v0] emailsService.deleteDraft chamado, id:", id, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("rascunhos").delete().eq("id", id)
      if (error) throw error
      return
    }

    await api.delete(`/emails/drafts/${id}`)
  },

  async search(
    query: string,
    filters?: {
      pasta?: string
      lido?: boolean
      importante?: boolean
      hasAnexos?: boolean
      dataInicio?: Date
      dataFim?: Date
    },
  ): Promise<EmailMessage[]> {
    console.log("[v0] emailsService.search chamado, query:", query, "filters:", filters, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const filtered = mockEmails.filter((e) => {
        const searchLower = query.toLowerCase()
        const matchesQuery =
          !query ||
          e.assunto.toLowerCase().includes(searchLower) ||
          e.remetente.toLowerCase().includes(searchLower) ||
          e.corpo.toLowerCase().includes(searchLower) ||
          e.destinatarios.some((d) => d.toLowerCase().includes(searchLower))

        const matchesPasta = !filters?.pasta || e.pasta === filters.pasta
        const matchesLido = filters?.lido === undefined || e.lido === filters.lido
        const matchesImportante = filters?.importante === undefined || e.importante === filters.importante
        const matchesAnexos = !filters?.hasAnexos || (e.anexos && e.anexos.length > 0)

        let matchesData = true
        if (filters?.dataInicio || filters?.dataFim) {
          const emailDate = new Date(e.criado_em)
          if (filters.dataInicio) matchesData = matchesData && emailDate >= filters.dataInicio
          if (filters.dataFim) matchesData = matchesData && emailDate <= filters.dataFim
        }

        return matchesQuery && matchesPasta && matchesLido && matchesImportante && matchesAnexos && matchesData
      })

      return filtered
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()

        let queryBuilder = supabase.from("emails").select("*, anexos(*)").order("criado_em", { ascending: false })

        // Apply text search
        if (query) {
          queryBuilder = queryBuilder.or(`assunto.ilike.%${query}%,remetente.ilike.%${query}%,corpo.ilike.%${query}%`)
        }

        // Apply filters
        if (filters?.pasta) {
          queryBuilder = queryBuilder.eq("pasta", filters.pasta)
        }
        if (filters?.lido !== undefined) {
          queryBuilder = queryBuilder.eq("lido", filters.lido)
        }
        if (filters?.importante !== undefined) {
          queryBuilder = queryBuilder.eq("importante", filters.importante)
        }
        if (filters?.dataInicio) {
          queryBuilder = queryBuilder.gte("criado_em", filters.dataInicio.toISOString())
        }
        if (filters?.dataFim) {
          queryBuilder = queryBuilder.lte("criado_em", filters.dataFim.toISOString())
        }

        const { data, error } = await queryBuilder

        if (error) {
          console.error("[v0] Erro ao buscar emails:", error.message)
          return []
        }

        let results = data || []

        // Filter by anexos if needed (can't do this in query)
        if (filters?.hasAnexos) {
          results = results.filter((e: any) => e.anexos && e.anexos.length > 0)
        }

        console.log("[v0] Resultados da busca:", results.length)
        return results
      } catch (error: any) {
        console.error("[v0] Erro na busca:", error.message)
        return []
      }
    }

    const { data } = await api.get<EmailMessage[]>("/emails/search", {
      params: { query, ...filters },
    })
    return data
  },
}
