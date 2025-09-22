import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await AuthService.login(email, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error, needsVerification: result.needsVerification }, { status: 400 })
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
    })

    // Set HTTP-only cookie for the token
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
