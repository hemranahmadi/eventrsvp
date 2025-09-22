import { Pool } from "pg"

console.log("[v0] Database URL exists:", !!process.env.EVENTRSVP_DATABASE_URL)
console.log("[v0] Database URL preview:", process.env.EVENTRSVP_DATABASE_URL?.substring(0, 30) + "...")

// Parse and validate the database URL
const databaseUrl = process.env.EVENTRSVP_DATABASE_URL
if (!databaseUrl) {
  console.error("[v0] EVENTRSVP_DATABASE_URL environment variable is not set!")
}

try {
  const url = new URL(databaseUrl!)
  console.log("[v0] Database host:", url.hostname)
  console.log("[v0] Database port:", url.port)
  console.log("[v0] Database name:", url.pathname.substring(1))
} catch (error) {
  console.error("[v0] Invalid database URL format:", error)
}

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
