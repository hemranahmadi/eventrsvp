import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.eventrsvp_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export { pool }
