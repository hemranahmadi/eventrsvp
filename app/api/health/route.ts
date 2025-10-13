import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Health check: Testing database connection")

    // Test basic database connectivity
    const result = await query("SELECT NOW() as current_time, version() as db_version")

    // Check if required tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'email_verification_tokens', 'user_sessions')
      ORDER BY table_name
    `)

    const existingTables = tablesResult.rows.map((row) => row.table_name)
    const requiredTables = ["users", "email_verification_tokens", "user_sessions"]
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    const healthStatus = {
      status: "healthy",
      database: {
        connected: true,
        serverTime: result.rows[0].current_time,
        version: result.rows[0].db_version,
        tables: {
          existing: existingTables,
          missing: missingTables,
          ready: missingTables.length === 0,
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlConfigured: !!process.env.EVENTRSVP_DATABASE_URL,
      },
    }

    console.log("[v0] Health check successful:", healthStatus)

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("[v0] Health check failed:", error)

    const errorStatus = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        connected: false,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlConfigured: !!process.env.EVENTRSVP_DATABASE_URL,
      },
    }

    return NextResponse.json(errorStatus, { status: 500 })
  }
}
