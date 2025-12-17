"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { emailsService } from "@/lib/emails"
import { formatDistanceToNow, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface Notification {
  id: number
  type: "new_email" | "important" | "reply"
  title: string
  message: string
  timestamp: string
  emailId?: number
  read: boolean
}

export function NotificationsBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load initial notifications
    loadNotifications()

    // Poll for new emails every 30 seconds
    const interval = setInterval(() => {
      checkForNewEmails()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const stats = await emailsService.getStats()
      const unreadEmails = await emailsService.getByFolder("inbox")
      const unread = unreadEmails.filter((e) => !e.lido)

      const newNotifications: Notification[] = unread.slice(0, 5).map((email) => ({
        id: email.id,
        type: email.importante ? "important" : "new_email",
        title: email.importante ? "Email importante" : "Novo email",
        message: `${email.remetente}: ${email.assunto}`,
        timestamp: email.criado_em,
        emailId: email.id,
        read: false,
      }))

      setNotifications(newNotifications)
      setUnreadCount(stats.nao_lidos)
    } catch (error) {
      console.error("[v0] Error loading notifications:", error)
    }
  }

  const checkForNewEmails = async () => {
    try {
      const stats = await emailsService.getStats()
      const currentUnread = unreadCount

      if (stats.nao_lidos > currentUnread) {
        // New email arrived
        await loadNotifications()

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification("Novo email recebido", {
            body: "Você tem novos emails não lidos",
            icon: "/favicon.ico",
          })
        }
      }
    } catch (error) {
      console.error("[v0] Error checking for new emails:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.emailId) {
      router.push(`/inbox/${notification.emailId}`)
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} não lidos</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium text-sm">{notification.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(notification.timestamp), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
            </DropdownMenuItem>
          ))
        )}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center" onClick={() => router.push("/inbox")}>
              Ver todos os emails
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
