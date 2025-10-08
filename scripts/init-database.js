const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

async function initDatabase() {
  console.log("Initializing database...")

  if (!process.env.EVENTRSVP_DATABASE_URL) {
    console.error("EVENTRSVP_DATABASE_URL environment variable is required")
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.EVENTRSVP_DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  try {
    // Test connection
    const client = await pool.connect()
    console.log("Database connection successful")

    // Read and execute SQL script
    const sqlPath = path.join(__dirname, "create-auth-tables.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    await client.query(sql)
    console.log("Database tables created successfully")

    client.release()
    await pool.end()

    console.log("Database initialization complete")
  } catch (error) {
    console.error("Database initialization failed:", error)
    process.exit(1)
  }
}

initDatabase()
