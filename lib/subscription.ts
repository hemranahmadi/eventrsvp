import { createBrowserClient } from "@supabase/ssr"

export async function checkPremiumStatus(): Promise<boolean> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("[v0] Error checking premium status:", error.message)
      return false
    }

    return data?.subscription_status === "active"
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
    } = await supabase.auth.getUser()

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
