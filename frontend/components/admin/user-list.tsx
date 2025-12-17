"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreVertical, Shield, UserIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UserListProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: number) => void
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  return (
    <div className="grid gap-3">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {user.role === "admin" ? <Shield className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-card-foreground">{user.nome}</p>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                      }
                    >
                      {user.role === "admin" ? "Admin" : "Agente"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Criado em {format(new Date(user.criadoEm), "PP", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(user)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-destructive">
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
