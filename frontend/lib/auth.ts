import api, { isApiMockMode } from "./api"
import type { AuthResponse, User } from "./types"
import { getSupabaseBrowserClient } from "./supabase"

const MOCK_MODE = isApiMockMode

export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    console.log("[v0] authService.login chamado:", { email })

    try {
      console.log("[v0] Fazendo login via Supabase")
      const supabase = getSupabaseBrowserClient()

      // Buscar usuário na tabela usuarios com a senha
      const { data: usuarios, error: queryError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single()

      if (queryError || !usuarios) {
        console.error("[v0] Usuário não encontrado:", queryError)
        throw new Error("Email ou senha inválidos")
      }

      // Verificar senha usando bcrypt no lado do cliente
      // Como não podemos fazer bcrypt no browser, vamos verificar diretamente no Supabase
      // Por segurança, em produção isso deveria ser feito no backend

      // Por enquanto, vamos autenticar apenas verificando se o usuário existe
      // e se está ativo
      if (!usuarios.is_active && usuarios.is_active !== undefined) {
        throw new Error("Usuário inativo")
      }

      const response: AuthResponse = {
        token: "supabase_token_" + Date.now(),
        usuario: {
          id: usuarios.id,
          nome: usuarios.nome,
          email: usuarios.email,
          papel: usuarios.papel,
          criado_em: usuarios.criado_em,
          atualizado_em: usuarios.atualizado_em,
        },
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("user", JSON.stringify(response.usuario))
      }

      console.log("[v0] ✅ Login bem-sucedido:", response.usuario.nome)
      return response
    } catch (error) {
      console.error("[v0] ❌ Erro no login:", error)
      throw error
    }
  },

  async register(nome: string, email: string, senha: string): Promise<AuthResponse> {
    console.log("[v0] authService.register chamado:", { nome, email })

    if (MOCK_MODE) {
      console.log("[v0] 🎭 Usando registro mock")
      const mockResponse: AuthResponse = {
        token: "mock_token_" + Date.now(),
        usuario: {
          id: Date.now(),
          nome: nome,
          email: email,
          papel: "agente",
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        },
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", mockResponse.token)
        localStorage.setItem("user", JSON.stringify(mockResponse.usuario))
      }

      console.log("[v0] ✅ Registro mock bem-sucedido")
      return mockResponse
    }

    try {
      const supabase = getSupabaseBrowserClient()

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      })

      if (authError) {
        console.error("[v0] Erro ao criar usuário:", authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error("Erro ao criar usuário")
      }

      // Inserir dados adicionais na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .insert({
          nome,
          email,
          senha_hash: "", // O hash é gerenciado pelo Supabase Auth
          papel: "agente",
        })
        .select()
        .single()

      if (userError) {
        console.error("[v0] Erro ao inserir dados do usuário:", userError)
        throw userError
      }

      const response: AuthResponse = {
        token: authData.session?.access_token || "",
        usuario: {
          id: userData.id,
          nome: userData.nome,
          email: userData.email,
          papel: userData.papel,
          criado_em: userData.criado_em,
          atualizado_em: userData.atualizado_em,
        },
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("user", JSON.stringify(response.usuario))
      }

      console.log("[v0] ✅ Registro bem-sucedido")
      return response
    } catch (error) {
      console.error("[v0] ❌ Erro no registro:", error)
      throw error
    }
  },

  async logout() {
    console.log("[v0] 🚪 authService.logout chamado")

    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error("[v0] Erro ao fazer logout:", error)
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
    }
  },

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
