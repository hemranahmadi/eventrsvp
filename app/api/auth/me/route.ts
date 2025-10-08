import { type NextRequest, NextResponse } from "next/server"
import { AuthServerService } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await AuthServerService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get current user API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
