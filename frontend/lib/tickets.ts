import api, { isApiMockMode, hasSupabaseIntegration } from "./api"
import type { Ticket, TicketDetalhes, TicketStats, Email } from "./types"
import { getSupabaseBrowserClient } from "./supabase"

const MOCK_MODE = isApiMockMode

const mockTickets: Ticket[] = [
  {
    id: 1,
    assunto: "Problema com login no sistema",
    status: "aberto",
    prioridade: "alta",
    cliente_email: "cliente1@example.com",
    cliente_nome: "João Silva",
    criado_em: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    assunto: "Dúvida sobre funcionalidade",
    status: "em_andamento",
    prioridade: "media",
    cliente_email: "cliente2@example.com",
    cliente_nome: "Maria Santos",
    criado_em: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    assunto: "Solicitação de nova feature",
    status: "aberto",
    prioridade: "baixa",
    cliente_email: "cliente3@example.com",
    cliente_nome: "Pedro Costa",
    criado_em: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    assunto: "Bug na página de relatórios",
    status: "resolvido",
    prioridade: "alta",
    cliente_email: "cliente4@example.com",
    cliente_nome: "Ana Paula",
    criado_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

const mockEmails: Record<number, Email[]> = {
  1: [
    {
      id: 1,
      ticket_id: 1,
      remetente: "cliente1@example.com",
      destinatarios: ["suporte@example.com"],
      assunto: "Problema com login no sistema",
      corpo: "Olá, não consigo fazer login no sistema. Já tentei recuperar a senha mas não funcionou.",
      tipo: "recebido",
      criado_em: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  2: [
    {
      id: 2,
      ticket_id: 2,
      remetente: "cliente2@example.com",
      destinatarios: ["suporte@example.com"],
      assunto: "Dúvida sobre funcionalidade",
      corpo: "Como faço para exportar os relatórios em formato PDF?",
      tipo: "recebido",
      criado_em: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      ticket_id: 2,
      remetente: "suporte@example.com",
      destinatarios: ["cliente2@example.com"],
      assunto: "Re: Dúvida sobre funcionalidade",
      corpo:
        "Olá Maria! Para exportar em PDF, basta clicar no botão de exportar no canto superior direito da tela de relatórios.",
      tipo: "enviado",
      criado_em: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

export const ticketsService = {
  async getAll(status?: string): Promise<Ticket[]> {
    console.log("[v0] ticketsService.getAll chamado, status:", status, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      let filtered = mockTickets
      if (status && status !== "todos") {
        filtered = mockTickets.filter((t) => t.status === status)
      }
      console.log("[v0] Retornando", filtered.length, "tickets mock")
      return filtered
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()
        let query = supabase.from("tickets").select("*")

        if (status && status !== "todos") {
          query = query.eq("status", status)
        }

        const { data, error } = await query.order("criado_em", { ascending: false })

        if (error) {
          console.error("[v0] Erro ao buscar tickets:", error.message)
          if (error.message.includes("does not exist") || error.message.includes("relation")) {
            console.warn("[v0] Tabelas não criadas no Supabase. Execute o script 000_setup_complete.sql")
            return []
          }
          throw error
        }

        console.log("[v0] Tickets retornados do Supabase:", data?.length || 0)

        return data || []
      } catch (error: any) {
        console.error("[v0] Erro ao buscar tickets:", error.message)
        return []
      }
    }

    const params = status ? { status } : {}
    const { data } = await api.get<Ticket[]>("/tickets", { params })
    return data
  },

  async getById(id: number): Promise<TicketDetalhes> {
    console.log("[v0] ticketsService.getById chamado, id:", id, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const ticket = mockTickets.find((t) => t.id === id)
      if (!ticket) throw new Error("Ticket não encontrado")
      return {
        ...ticket,
        emails: mockEmails[id] || [],
      }
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()

        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", id)
          .single()

        if (ticketError) {
          console.error("[v0] Erro ao buscar ticket:", ticketError)
          throw ticketError
        }

        let agente = null
        if (ticketData.atribuido_a) {
          const { data: agenteData } = await supabase
            .from("usuarios")
            .select("id, nome, email, papel")
            .eq("id", ticketData.atribuido_a)
            .single()

          agente = agenteData
        }

        const { data: emailsData, error: emailsError } = await supabase
          .from("emails")
          .select("*")
          .eq("ticket_id", id)
          .order("criado_em", { ascending: true })

        if (emailsError) {
          console.error("[v0] Erro ao buscar emails:", emailsError)
          throw emailsError
        }

        const emailsComAnexos = await Promise.all(
          (emailsData || []).map(async (e) => {
            const { data: anexosData } = await supabase.from("anexos").select("*").eq("email_id", e.id)

            return {
              id: e.id,
              ticket_id: e.ticket_id,
              remetente: e.remetente,
              destinatarios: e.destinatarios,
              assunto: e.assunto,
              corpo: e.corpo,
              html: e.html,
              tipo: e.tipo,
              criado_em: e.criado_em,
              anexos: anexosData || [],
            }
          }),
        )

        return {
          ...ticketData,
          agente: agente,
          emails: emailsComAnexos,
        }
      } catch (error: any) {
        console.error("[v0] Erro ao buscar detalhes do ticket:", error.message)
        throw error
      }
    }

    const { data } = await api.get<TicketDetalhes>(`/tickets/${id}`)
    return data
  },

  async getStats(): Promise<TicketStats> {
    console.log("[v0] ticketsService.getStats chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const stats = {
        total: mockTickets.length,
        abertos: mockTickets.filter((t) => t.status === "aberto").length,
        emAndamento: mockTickets.filter((t) => t.status === "em_andamento").length,
        resolvidosHoje: mockTickets.filter((t) => {
          const hoje = new Date().toDateString()
          return t.status === "resolvido" && new Date(t.atualizado_em).toDateString() === hoje
        }).length,
      }
      console.log("[v0] Retornando stats mock:", stats)
      return stats
    }

    if (hasSupabaseIntegration) {
      try {
        const supabase = getSupabaseBrowserClient()

        const { data: allTickets, error } = await supabase.from("tickets").select("status, atualizado_em")

        if (error) {
          if (error.message.includes("does not exist") || error.message.includes("relation")) {
            console.warn("[v0] Tabelas não criadas no Supabase. Execute o script 000_setup_complete.sql")
            return { total: 0, abertos: 0, emAndamento: 0, resolvidosHoje: 0 }
          }
          throw error
        }

        if (!allTickets) {
          return { total: 0, abertos: 0, emAndamento: 0, resolvidosHoje: 0 }
        }

        const hoje = new Date().toDateString()

        return {
          total: allTickets.length,
          abertos: allTickets.filter((t) => t.status === "aberto").length,
          emAndamento: allTickets.filter((t) => t.status === "em_andamento").length,
          resolvidosHoje: allTickets.filter((t) => {
            return t.status === "resolvido" && new Date(t.atualizado_em).toDateString() === hoje
          }).length,
        }
      } catch (error: any) {
        console.error("[v0] Erro ao buscar estatísticas:", error.message)
        return { total: 0, abertos: 0, emAndamento: 0, resolvidosHoje: 0 }
      }
    }

    const { data } = await api.get<TicketStats>("/tickets/stats")
    return data
  },

  async updateStatus(id: number, status: string): Promise<Ticket> {
    console.log("[v0] ticketsService.updateStatus chamado, id:", id, "status:", status, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const ticket = mockTickets.find((t) => t.id === id)
      if (!ticket) throw new Error("Ticket não encontrado")
      ticket.status = status as any
      ticket.atualizado_em = new Date().toISOString()
      return ticket
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase.from("tickets").update({ status }).eq("id", id).select().single()

      if (error) throw error

      return data
    }

    const { data } = await api.patch<Ticket>(`/tickets/${id}`, { status })
    return data
  },

  async updatePriority(id: number, prioridade: string): Promise<Ticket> {
    console.log("[v0] ticketsService.updatePriority chamado, id:", id, "prioridade:", prioridade, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const ticket = mockTickets.find((t) => t.id === id)
      if (!ticket) throw new Error("Ticket não encontrado")
      ticket.prioridade = prioridade as any
      ticket.atualizado_em = new Date().toISOString()
      return ticket
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase.from("tickets").update({ prioridade }).eq("id", id).select().single()

      if (error) throw error

      return data
    }

    const { data } = await api.patch<Ticket>(`/tickets/${id}`, { prioridade })
    return data
  },

  async reply(id: number, corpo: string, anexos?: File[]): Promise<Email> {
    console.log("[v0] ticketsService.reply chamado, id:", id, "mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const newEmail: Email = {
        id: Date.now(),
        ticket_id: id,
        remetente: "suporte@example.com",
        destinatarios: [mockTickets.find((t) => t.id === id)?.cliente_email || "cliente@example.com"],
        assunto: `Re: ${mockTickets.find((t) => t.id === id)?.assunto}`,
        corpo,
        tipo: "enviado",
        criado_em: new Date().toISOString(),
      }
      if (!mockEmails[id]) mockEmails[id] = []
      mockEmails[id].push(newEmail)
      return newEmail
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      const { data: ticket } = await supabase.from("tickets").select("*").eq("id", id).single()

      if (!ticket) throw new Error("Ticket não encontrado")

      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .insert({
          ticket_id: id,
          remetente: "suporte@example.com",
          destinatarios: [ticket.cliente_email],
          assunto: `Re: ${ticket.assunto}`,
          corpo,
          tipo: "enviado",
        })
        .select()
        .single()

      if (emailError) throw emailError

      return {
        id: emailData.id,
        ticket_id: emailData.ticket_id,
        remetente: emailData.remetente,
        destinatarios: emailData.destinatarios,
        assunto: emailData.assunto,
        corpo: emailData.corpo,
        html: emailData.html,
        tipo: emailData.tipo,
        criado_em: emailData.criado_em,
      }
    }

    const formData = new FormData()
    formData.append("corpo", corpo)

    if (anexos) {
      anexos.forEach((file) => {
        formData.append("anexos", file)
      })
    }

    const { data } = await api.post<Email>(`/tickets/${id}/responder`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  },
}
