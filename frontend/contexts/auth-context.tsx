"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "@/lib/auth"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] AuthProvider inicializando")
    const user = authService.getUser()
    console.log("[v0] Usuário atual:", user)
    setUser(user)
    setIsLoading(false)
  }, [])

  const login = async (email: string, senha: string) => {
    console.log("[v0] AuthContext.login chamado")
    const response = await authService.login(email, senha)
    console.log("[v0] Resposta do login recebida, atualizando estado do usuário")
    setUser(response.usuario)
  }

  const register = async (nome: string, email: string, senha: string) => {
    console.log("[v0] AuthContext.register chamado")
    const response = await authService.register(nome, email, senha)
    setUser(response.usuario)
  }

  const logout = () => {
    console.log("[v0] AuthContext.logout chamado")
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
