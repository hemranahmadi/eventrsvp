import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-square-hmacsha256-signature")

    console.log("[v0] Square webhook received")
    console.log("[v0] Event body:", body)

    // Verify webhook signature
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
    if (!webhookSignatureKey) {
      console.error("[v0] Missing SQUARE_WEBHOOK_SIGNATURE_KEY")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    // Verify the signature
    const hmac = crypto.createHmac("sha256", webhookSignatureKey)
    const expectedSignature = hmac.update(body).digest("base64")

    if (signature !== expectedSignature) {
      console.error("[v0] Invalid webhook signature")
      console.error("[v0] Expected:", expectedSignature)
      console.error("[v0] Received:", signature)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("[v0] Square webhook event type:", event.type)
    console.log("[v0] Event data:", JSON.stringify(event.data, null, 2))

    // Handle payment completed event
    if (event.type === "payment.created" || event.type === "payment.updated") {
      const payment = event.data?.object?.payment

      console.log("[v0] Payment status:", payment?.status)
      console.log("[v0] Payment details:", JSON.stringify(payment, null, 2))

      if (payment?.status === "COMPLETED") {
        console.log("[v0] Payment completed:", payment.id)

        // Extract customer email from payment
        const customerEmail = payment.buyer_email_address || payment.receipt_email

        console.log("[v0] Customer email:", customerEmail)

        if (!customerEmail) {
          console.error("[v0] No customer email found in payment")
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

        // Upsert subscription status to user_profiles
        const { error: updateError } = await supabase.from("user_profiles").upsert(
          {
            id: user.id,
            subscription_status: "active",
            subscription_started_at: new Date().toISOString(),
            square_customer_id: payment.customer_id || null,
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
    }

    // Acknowledge other events
    console.log("[v0] Event acknowledged but not processed")
    return NextResponse.json({ success: true, message: "Event received" })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
