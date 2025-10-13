import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"
  const type = requestUrl.searchParams.get("type")
  const hashParams = requestUrl.hash ? new URLSearchParams(requestUrl.hash.substring(1)) : null
  const accessToken = hashParams?.get("access_token")
  const refreshToken = hashParams?.get("refresh_token")

  console.log("[v0] Auth callback received:", { code: !!code, type, next, hasHashTokens: !!accessToken })

  if (accessToken && refreshToken && type === "recovery") {
    console.log("[v0] Password recovery tokens found in hash")
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
            } catch (error) {
              console.log("[v0] Cookie setting error:", error)
            }
          },
        },
      },
    )

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) {
      console.error("[v0] Error setting session from hash tokens:", error)
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url))
    }

    console.log("[v0] Session set from hash tokens, redirecting to reset password")
    return NextResponse.redirect(new URL("/auth/reset-password", request.url))
  }

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
            } catch (error) {
              console.log("[v0] Cookie setting error:", error)
            }
          },
        },
      },
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Error exchanging code for session:", error)
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url))
    }

    console.log("[v0] Session exchange successful, user:", data.user?.id)

    if (type === "recovery") {
      console.log("[v0] Password recovery flow detected, redirecting to reset password")
      return NextResponse.redirect(new URL("/auth/reset-password", request.url))
    }

    // For other flows (email verification, etc.), redirect to the next page
    console.log("[v0] Redirecting to:", next)
    return NextResponse.redirect(new URL(next, request.url))
  }

  console.error("[v0] No code provided in callback")
  return NextResponse.redirect(new URL("/auth/login?error=No authentication code provided", request.url))
}
