import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import type Stripe from "stripe"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    console.log("[v0] Stripe webhook received")

    if (!signature) {
      console.error("[v0] Missing stripe-signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("[v0] Missing STRIPE_WEBHOOK_SECRET")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("[v0] Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    console.log("[v0] Stripe webhook event type:", event.type)

    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      console.log("[v0] Checkout session completed:", session.id)
      console.log("[v0] Customer email:", session.customer_email)

      const customerEmail = session.customer_email

      if (!customerEmail) {
        console.error("[v0] No customer email found in session")
        return NextResponse.json({ error: "No customer email" }, { status: 400 })
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Find user by email in auth.users
      console.log("[v0] Looking up user by email:", customerEmail)
      const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        console.error("[v0] Error listing users:", authError)
        return NextResponse.json({ error: "Failed to list users" }, { status: 500 })
      }

      const user = authUser?.users?.find((u) => u.email === customerEmail)

      if (!user) {
        console.error("[v0] User not found for email:", customerEmail)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      console.log("[v0] Found user:", user.id, user.email)

      // Activate premium subscription
      const { error: updateError } = await supabase.from("user_profiles").upsert(
        {
          id: user.id,
          is_premium: true,
          subscription_status: "active",
          subscription_started_at: new Date().toISOString(),
          stripe_customer_id: (session.customer as string) || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (updateError) {
        console.error("[v0] Error updating subscription:", updateError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }

      console.log("[v0] Successfully activated premium for user:", user.email)
      return NextResponse.json({ success: true, message: "Subscription activated" })
    }

    // Handle subscription deleted (cancellation)
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      console.log("[v0] Subscription cancelled for customer:", customerId)

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Find user by stripe_customer_id
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (profileError || !profile) {
        console.error("[v0] User profile not found for customer:", customerId)
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }

      // Deactivate premium
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          is_premium: false,
          subscription_status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (updateError) {
        console.error("[v0] Error cancelling subscription:", updateError)
        return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
      }

      console.log("[v0] Successfully cancelled premium for user:", profile.id)
      return NextResponse.json({ success: true, message: "Subscription cancelled" })
    }

    // Acknowledge other events
    console.log("[v0] Event acknowledged but not processed")
    return NextResponse.json({ success: true, message: "Event received" })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
