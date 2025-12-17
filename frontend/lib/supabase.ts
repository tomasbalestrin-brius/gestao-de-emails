import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vgzylypzrudzrhueoros.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenlseXB6cnVkenJodWVvcm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc2MDYsImV4cCI6MjA4MTQ4MzYwNn0.gbXPQIPMq8PNFwzyiwV-WvWSa4Hlcre7Nz_gmva6qJQ"

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}
