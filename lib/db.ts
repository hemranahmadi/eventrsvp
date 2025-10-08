import { Pool, type PoolClient } from "pg"

console.log("[v0] Initializing database connection...")
console.log("[v0] Database URL exists:", !!process.env.EVENTRSVP_DATABASE_URL)

if (!process.env.EVENTRSVP_DATABASE_URL) {
  throw new Error("EVENTRSVP_DATABASE_URL environment variable is required")
}

// Parse the database URL to validate it
let dbUrl: URL
try {
  dbUrl = new URL(process.env.EVENTRSVP_DATABASE_URL)
  console.log("[v0] Database host:", dbUrl.hostname)
  console.log("[v0] Database port:", dbUrl.port)
  console.log("[v0] Database name:", dbUrl.pathname.slice(1))
} catch (error) {
  console.error("[v0] Invalid database URL format:", error)
  throw new Error("Invalid EVENTRSVP_DATABASE_URL format")
}

const pool = new Pool({
  connectionString: process.env.EVENTRSVP_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  min: 1,
})

pool.on("connect", (client: PoolClient) => {
  console.log("[v0] New database client connected")
})

pool.on("error", (err) => {
  console.error("[v0] Database pool error:", err.message)
})

// Test connection and initialize database
async function initializeDatabase() {
  let client: PoolClient | null = null
  try {
    console.log("[v0] Testing database connection...")
    client = await pool.connect()

    // Test basic query
    const result = await client.query("SELECT NOW() as current_time")
    console.log("[v0] Database connection successful. Server time:", result.rows[0].current_time)

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `)

    if (!tableCheck.rows[0].exists) {
      console.log("[v0] Users table does not exist. Database needs to be initialized.")
      console.log("[v0] Please run the SQL script in scripts/create-auth-tables.sql")
    } else {
      console.log("[v0] Users table exists. Database is ready.")
    }
  } catch (error) {
    console.error("[v0] Database initialization failed:", error)
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

// Initialize database on module load
initializeDatabase().catch((error) => {
  console.error("[v0] Failed to initialize database:", error.message)
})

// Helper function to execute queries with proper error handling
export async function query(text: string, params?: any[]): Promise<any> {
  let client: PoolClient | null = null
  try {
    client = await pool.connect()
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

// Helper function to get a client for transactions
export async function getClient(): Promise<PoolClient> {
  return await pool.connect()
}

export { pool }
