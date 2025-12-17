import type { Metadata } from "next"
import { Mail } from "lucide-react"
import { EmailListItem } from "@/components/emails/email-list-item"
import { emailsService } from "@/lib/emails"

export const metadata: Metadata = {
  title: "Spam - Email Management",
  description: "Emails marcados como spam",
}

async function loadEmails() {
  try {
    const emails = await emailsService.getByFolder("spam")
    return emails
  } catch (error) {
    console.error("[v0] Error loading spam emails:", error)
    return []
  }
}

export default async function SpamPage() {
  const emails = await loadEmails()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spam</h1>
          <p className="text-muted-foreground">Emails marcados como spam</p>
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum spam</h3>
          <p className="mt-2 text-sm text-muted-foreground">Ótimo! Você não tem emails marcados como spam.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {emails.map((email) => (
            <EmailListItem key={email.id} email={email} href={`/spam/${email.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
