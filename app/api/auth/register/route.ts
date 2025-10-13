import { type NextRequest, NextResponse } from "next/server"
import { AuthServerService } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Registration API called")

    const body = await request.json()
    console.log("[v0] Registration request body:", { ...body, password: "[REDACTED]" })

    const result = await AuthServerService.register(body)
    console.log("[v0] Registration result:", {
      ...result,
      user: result.user ? { ...result.user, id: "[REDACTED]" } : undefined,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      needsVerification: result.needsVerification,
      user: result.user,
    })
  } catch (error) {
    console.error("[v0] Registration API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
