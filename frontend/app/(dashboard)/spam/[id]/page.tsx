import { notFound } from "next/navigation"
import { EmailViewer } from "@/components/emails/email-viewer"
import { emailsService } from "@/lib/emails"

async function loadEmail(id: string) {
  try {
    const email = await emailsService.getById(Number.parseInt(id))
    return email
  } catch (error) {
    console.error("[v0] Error loading email:", error)
    return null
  }
}

export default async function SpamEmailPage({ params }: { params: { id: string } }) {
  const email = await loadEmail(params.id)

  if (!email) {
    notFound()
  }

  return <EmailViewer email={email} folder="spam" />
}
