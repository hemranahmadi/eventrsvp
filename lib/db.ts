import { Pool } from "pg"

console.log("[v0] Database URL exists:", !!process.env.EVENTRSVP_DATABASE_URL)
console.log("[v0] Database URL preview:", process.env.EVENTRSVP_DATABASE_URL?.substring(0, 20) + "...")

const pool = new Pool({
  connectionString: process.env.EVENTRSVP_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
})

pool.on("connect", () => {
  console.log("[v0] Database connected successfully")
})

pool.on("error", (err) => {
  console.error("[v0] Database pool error:", err)
})

async function testConnection() {
  try {
    const client = await pool.connect()
    console.log("[v0] Database connection test successful")
    client.release()
  } catch (error) {
    console.error("[v0] Database connection test failed:", error)
  }
}

testConnection()

export { pool }
