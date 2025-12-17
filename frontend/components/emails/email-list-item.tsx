import Link from "next/link"
import { formatDistanceToNow, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Star, Paperclip, Mail, MailOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EmailMessage } from "@/lib/types"

interface EmailListItemProps {
  email: EmailMessage
  folder: string
}

export function EmailListItem({ email, folder }: EmailListItemProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      if (!isValid(date)) return "Data inválida"
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
    } catch {
      return "Data inválida"
    }
  }

  const getEmailPreview = (text: string, maxLength = 100) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const displaySender = folder === "sent" ? email.destinatarios[0] : email.remetente

  return (
    <Link
      href={`/${folder}/${email.id}`}
      className={cn(
        "block rounded-lg border bg-card p-4 transition-all hover:bg-accent",
        !email.lido && "border-l-4 border-l-primary bg-card/50",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-1", email.lido ? "text-muted-foreground" : "text-foreground")}>
          {email.lido ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("font-medium", !email.lido && "font-semibold")}>{displaySender}</span>
            <div className="flex items-center gap-2">
              {email.importante && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
              {email.anexos && email.anexos.length > 0 && <Paperclip className="h-4 w-4 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{formatDate(email.criado_em)}</span>
            </div>
          </div>

          <p className={cn("text-sm", !email.lido && "font-semibold")}>{email.assunto || "(Sem assunto)"}</p>

          <p className="text-sm text-muted-foreground">{getEmailPreview(email.corpo)}</p>
        </div>
      </div>
    </Link>
  )
}
