import api, { isApiMockMode, hasSupabaseIntegration } from "./api"
import type { User } from "./types"
import { getSupabaseBrowserClient } from "./supabase"

const MOCK_MODE = isApiMockMode

const mockUsers: User[] = [
  {
    id: 1,
    nome: "Admin User",
    email: "admin@example.com",
    papel: "admin",
    criado_em: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    nome: "Agente Suporte",
    email: "agente@example.com",
    papel: "agente",
    criado_em: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    atualizado_em: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const usersService = {
  async getAll(): Promise<User[]> {
    console.log("[v0] usersService.getAll chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockUsers
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase.from("usuarios").select("*").order("criado_em", { ascending: false })

      if (error) throw error

      return data || []
    }

    const { data } = await api.get<User[]>("/usuarios")
    return data
  },

  async create(nome: string, email: string, senha: string, papel: "admin" | "agente"): Promise<User> {
    console.log("[v0] usersService.create chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newUser: User = {
        id: Date.now(),
        nome,
        email,
        papel,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      }
      mockUsers.push(newUser)
      return newUser
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      })

      if (authError) throw authError

      // Inserir dados adicionais
      const { data, error } = await supabase
        .from("usuarios")
        .insert({
          nome,
          email,
          senha_hash: "",
          papel,
        })
        .select()
        .single()

      if (error) throw error

      return data
    }

    const { data } = await api.post<User>("/usuarios", {
      nome,
      email,
      senha,
      papel,
    })
    return data
  },

  async update(id: number, updates: Partial<User>): Promise<User> {
    console.log("[v0] usersService.update chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const user = mockUsers.find((u) => u.id === id)
      if (!user) throw new Error("Usuário não encontrado")
      Object.assign(user, updates)
      user.atualizado_em = new Date().toISOString()
      return user
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase.from("usuarios").update(updates).eq("id", id).select().single()

      if (error) throw error

      return data
    }

    const { data } = await api.patch<User>(`/usuarios/${id}`, updates)
    return data
  },

  async delete(id: number): Promise<void> {
    console.log("[v0] usersService.delete chamado, mock:", MOCK_MODE)

    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const index = mockUsers.findIndex((u) => u.id === id)
      if (index !== -1) mockUsers.splice(index, 1)
      return
    }

    if (hasSupabaseIntegration) {
      const supabase = getSupabaseBrowserClient()

      const { error } = await supabase.from("usuarios").delete().eq("id", id)

      if (error) throw error

      return
    }

    await api.delete(`/usuarios/${id}`)
  },
}
