"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { UserList } from "@/components/admin/user-list"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { usersService } from "@/lib/users"
import type { User } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/tickets")
      return
    }
    loadUsers()
  }, [currentUser])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await usersService.getAll()
      setUsers(data)
    } catch (error) {
      console.error("[v0] Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (nome: string, email: string, senha: string, role: "admin" | "agente") => {
    await usersService.create(nome, email, senha, role)
    loadUsers()
  }

  const handleEditUser = (user: User) => {
    console.log("[v0] Edit user:", user)
  }

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await usersService.delete(userId)
        loadUsers()
      } catch (error) {
        console.error("[v0] Error deleting user:", error)
      }
    }
  }

  if (currentUser?.role !== "admin") {
    return null
  }

  return (
    <div className="flex flex-col">
      <Header title="Usuários" description="Gerencie os usuários do sistema" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Todos os Usuários</h2>
            <p className="text-sm text-muted-foreground">{users.length} usuários cadastrados</p>
          </div>
          <CreateUserDialog onCreateUser={handleCreateUser} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Carregando usuários...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <UserList users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
        )}
      </div>
    </div>
  )
}
