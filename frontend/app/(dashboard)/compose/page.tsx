"use client"

import { Header } from "@/components/layout/header"
import { EmailComposer } from "@/components/emails/email-composer"

export default function ComposePage() {
  return (
    <div className="flex flex-col">
      <Header title="Compor Email" description="Crie e envie um novo email" />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <EmailComposer />
        </div>
      </div>
    </div>
  )
}
