import { type NextRequest, NextResponse } from "next/server"
import { AuthServerService } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await AuthServerService.login(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          needsVerification: result.needsVerification,
        },
        { status: 400 },
      )
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
    })

    // Set secure HTTP-only cookie
    if (result.token) {
      response.cookies.set("auth-token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
