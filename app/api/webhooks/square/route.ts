import { type NextRequest, NextResponse } from "next"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-square-hmacsha256-signature")

    console.log("[v0] Square webhook received")

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
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("[v0] Square webhook event type:", event.type)

    // Handle payment completed event
    if (event.type === "payment.created" || event.type === "payment.updated") {
      const payment = event.data?.object?.payment

      if (payment?.status === "COMPLETED") {
        console.log("[v0] Payment completed:", payment.id)

        // Extract customer email from payment metadata or customer info
        const customerEmail = payment.buyer_email_address || payment.customer_id

        if (!customerEmail) {
          console.error("[v0] No customer email found in payment")
          return NextResponse.json({ error: "No customer email" }, { status: 400 })
        }

        // Update user subscription status in Supabase
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data: user, error: fetchError } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", customerEmail)
          .single()

        if (fetchError || !user) {
          console.error("[v0] User not found for email:", customerEmail)
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Update subscription status
        const { error: updateError } = await supabase
          .from("users")
          .update({
            is_premium: true,
            subscription_status: "active",
            subscription_started_at: new Date().toISOString(),
            square_customer_id: payment.customer_id || null,
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("[v0] Error updating subscription:", updateError)
          return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
        }

        console.log("[v0] Successfully activated premium for user:", user.email)
        return NextResponse.json({ success: true, message: "Subscription activated" })
      }
    }

    // Acknowledge other events
    return NextResponse.json({ success: true, message: "Event received" })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
