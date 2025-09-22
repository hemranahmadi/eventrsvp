import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (token) {
      await AuthService.logout(token)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("auth-token")

    return response
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
