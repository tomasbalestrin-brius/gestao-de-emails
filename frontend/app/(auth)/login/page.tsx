import { LoginForm } from "@/components/auth/login-form"
import { MockModeBanner } from "@/components/layout/mock-mode-banner"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <MockModeBanner />
        <LoginForm />
      </div>
    </div>
  )
}
