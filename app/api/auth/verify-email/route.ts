import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 })
    }

    const result = await AuthService.verifyEmail(email, code)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error) {
    console.error("Email verification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
