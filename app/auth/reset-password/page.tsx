import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import ResetPasswordForm from "./reset-password-form"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { session_verified?: string }
}) {
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
          } catch {}
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("[v0] Reset password page - session check:", {
    hasSession: !!session,
    sessionVerified: searchParams.session_verified,
    userEmail: session?.user?.email,
  })

  // Only allow access if there's a valid session and it came from callback
  if (!session || !searchParams.session_verified) {
    console.log("[v0] No valid session, redirecting to forgot password")
    redirect("/auth/forgot-password?error=invalid_reset_link")
  }

  return <ResetPasswordForm userEmail={session.user.email} />
}
