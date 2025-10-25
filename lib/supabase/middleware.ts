import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
  } catch (error: any) {
    console.log("[v0] Auth error in middleware:", error?.message || error)

    // Clear all auth cookies if refresh token is invalid
    const authCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.includes("supabase") || cookie.name.includes("auth"))

    authCookies.forEach((cookie) => {
      supabaseResponse.cookies.delete(cookie.name)
    })
  }

  return supabaseResponse
}
