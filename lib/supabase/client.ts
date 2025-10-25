import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

export function createBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey)
}

export function createClient() {
  const client = createBrowserClientSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  client.auth.onAuthStateChange((event, session) => {
    if (event === "TOKEN_REFRESHED" && !session) {
      console.log("[v0] Token refresh failed, clearing session")
      // Clear the session if token refresh fails
      client.auth.signOut({ scope: "local" })
    }
  })

  return client
}
