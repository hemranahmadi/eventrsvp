import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"
  const type = requestUrl.searchParams.get("type")

  console.log("[v0] Callback route hit:", { code: !!code, type, next })

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )

    console.log("[v0] Exchanging code for session")
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log("[v0] Code exchange successful, type:", type)
      if (type === "recovery") {
        console.log("[v0] Redirecting to reset password page")
        return NextResponse.redirect(new URL("/auth/reset-password", request.url))
      }

      // For other flows (email verification, etc.), redirect to the next page
      console.log("[v0] Redirecting to:", next)
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error("[v0] Code exchange failed:", error)
    }
  } else {
    console.log("[v0] No code parameter found")
  }

  // Return the user to an error page with instructions
  console.log("[v0] Callback failed, redirecting to login")
  return NextResponse.redirect(new URL("/auth/login?error=auth_callback_failed", request.url))
}
