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
    const cookieStore = await cookies()
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    console.log("[v0] Exchanging code for session")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      console.log("[v0] Code exchange successful, session user:", data.session.user.email)
      console.log("[v0] Type parameter:", type)

      const redirectUrl = type === "recovery" ? `/auth/reset-password?session_verified=true` : next
      console.log("[v0] Redirecting to:", redirectUrl)

      return NextResponse.redirect(new URL(redirectUrl, request.url), response)
    } else {
      console.error("[v0] Code exchange failed:", error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error?.message || "Authentication failed")}`, request.url),
      )
    }
  } else {
    console.log("[v0] No code parameter found")
  }

  // Return the user to an error page with instructions
  console.log("[v0] Callback failed, redirecting to login")
  return NextResponse.redirect(new URL("/auth/login?error=auth_callback_failed", request.url))
}
