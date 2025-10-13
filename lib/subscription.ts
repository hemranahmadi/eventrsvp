import { createBrowserClient } from "@supabase/ssr"

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("[v0] Auth error in checkPremiumStatus:", authError.message)
      return false
    }

    if (!user) {
      return false
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error checking premium status:", error.message)
      return false
    }

    if (!data) {
      return false
    }

    return data.subscription_status === "active"
  } catch (error) {
    console.error("[v0] Error in checkPremiumStatus:", error)
    return false
  }
}

export async function activatePremium(): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("[v0] Auth error in activatePremium:", authError.message)
      return { success: false, error: authError.message }
    }

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      is_premium: true,
      subscription_status: "active",
      subscription_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error activating premium:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in activatePremium:", error)
    return { success: false, error: "Failed to activate premium" }
  }
}
