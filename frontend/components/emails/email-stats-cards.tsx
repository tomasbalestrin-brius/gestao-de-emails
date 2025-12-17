import { Card, CardContent } from "@/components/ui/card"
import { Inbox, Mail, Star, TrendingUp } from "lucide-react"
import type { EmailStats } from "@/lib/types"

interface EmailStatsCardsProps {
  stats: EmailStats
}

export function EmailStatsCards({ stats }: EmailStatsCardsProps) {
  const cards = [
    {
      title: "Total na Caixa",
      value: stats.total,
      icon: Inbox,
      color: "text-blue-500",
    },
    {
      title: "Não Lidos",
      value: stats.nao_lidos,
      icon: Mail,
      color: "text-orange-500",
    },
    {
      title: "Importantes",
      value: stats.importantes,
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "Recebidos Hoje",
      value: stats.hoje,
      icon: TrendingUp,
      color: "text-green-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-card-foreground">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
