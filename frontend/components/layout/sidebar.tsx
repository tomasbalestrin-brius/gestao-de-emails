"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Inbox, Send, FileText, Trash2, Archive, Settings, Users, LogOut, Mail, ShieldAlert } from "lucide-react"
import { emailsService } from "@/lib/emails"

const emailFolders = [
  { name: "Caixa de Entrada", href: "/inbox", icon: Inbox, pasta: "inbox" },
  { name: "Enviados", href: "/sent", icon: Send, pasta: "sent" },
  { name: "Rascunhos", href: "/drafts", icon: FileText, pasta: "drafts" },
  { name: "Arquivados", href: "/archived", icon: Archive, pasta: "archived" },
  { name: "Spam", href: "/spam", icon: ShieldAlert, pasta: "spam" },
  { name: "Lixeira", href: "/trash", icon: Trash2, pasta: "trash" },
]

const navigation = [{ name: "Configurações", href: "/settings", icon: Settings }]

const adminNavigation = [{ name: "Usuários", href: "/admin/users", icon: Users }]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const stats = await emailsService.getStats()
        setUnreadCount(stats.nao_lidos)
      } catch (error) {
        console.error("[v0] Error loading unread count:", error)
      }
    }

    loadUnreadCount()

    // Update count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Mail className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-semibold text-sidebar-foreground">{"Email Manager"}</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60">{"Pastas"}</div>
        {emailFolders.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const showBadge = item.pasta === "inbox" && unreadCount > 0

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {showBadge && (
                <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Link>
          )
        })}

        <div className="my-4 border-t border-sidebar-border" />

        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}

        {user?.role === "admin" && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60">{"Admin"}</div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            {user?.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.nome}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-sidebar-foreground">
          <LogOut className="h-5 w-5" />
          {"Sair"}
        </Button>
      </div>
    </div>
  )
}
