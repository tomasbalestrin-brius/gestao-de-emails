"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { NotificationsBell } from "@/components/notifications/notifications-bell"

interface HeaderProps {
  title: string
  description?: string
  showSearch?: boolean
  showNotifications?: boolean
  onSearch?: (query: string) => void
}

export function Header({ title, description, showSearch = false, showNotifications = true, onSearch }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar emails..."
                className="pl-9"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}

          {showNotifications && <NotificationsBell />}
        </div>
      </div>
    </div>
  )
}
