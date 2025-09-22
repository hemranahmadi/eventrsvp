import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.EVENTRSVP_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export { pool }
