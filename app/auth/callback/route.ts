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
              console.error("[v0] Error setting cookies:", error)
            }
          },
        },
      },
    )

    console.log("[v0] Exchanging code for session")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      console.log("[v0] Code exchange successful, session user:", data.session.user.email)
      console.log("[v0] Type parameter:", type)

      const redirectUrl = type === "recovery" ? "/auth/reset-password" : next
      console.log("[v0] Redirecting to:", redirectUrl)

      const response = NextResponse.redirect(new URL(redirectUrl, request.url))

      // Ensure session cookies are set in the response
      const sessionCookies = cookieStore.getAll()
      sessionCookies.forEach((cookie) => {
        if (cookie.name.includes("supabase") || cookie.name.includes("auth")) {
          response.cookies.set(cookie.name, cookie.value, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          })
        }
      })

      return response
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
