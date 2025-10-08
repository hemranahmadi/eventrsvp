import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { getClient } from "./db"

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: string
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
  needsVerification?: boolean
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"
const JWT_EXPIRES_IN = "7d"
const VERIFICATION_CODE_EXPIRES = 15 * 60 * 1000 // 15 minutes

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export class AuthServerService {
  // Password utilities
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // JWT utilities
  static generateToken(userId: string): string {
    return jwt.sign({ userId, type: "access" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return decoded.type === "access" ? { userId: decoded.userId } : null
    } catch {
      return null
    }
  }

  // Verification code utilities
  static generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  static async sendVerificationEmail(email: string, code: string): Promise<void> {
    // TODO: Integrate with real email service (SendGrid, Resend, etc.)
    console.log(`[EMAIL] Verification code for ${email}: ${code}`)
    console.log(`[EMAIL] Subject: Verify your EventRSVP account`)
    console.log(`[EMAIL] Code expires in 15 minutes`)
  }

  // Database operations
  static async register(input: unknown): Promise<AuthResult> {
    console.log("[v0] AuthServerService.register called")

    let client
    try {
      console.log("[v0] Attempting to connect to database")
      client = await getClient()
      console.log("[v0] Database connection successful")

      // Validate input
      const { name, email, password } = registerSchema.parse(input)
      console.log("[v0] Input validation successful for email:", email)

      // Check if user exists
      console.log("[v0] Checking if user exists")
      const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()])

      if (existingUser.rows.length > 0) {
        console.log("[v0] User already exists")
        return { success: false, error: "An account with this email already exists" }
      }

      // Hash password
      console.log("[v0] Hashing password")
      const passwordHash = await this.hashPassword(password)

      // Create user
      console.log("[v0] Creating user in database")
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, email_verified, created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, email_verified, created_at`,
        [name.trim(), email.toLowerCase(), passwordHash, false, new Date().toISOString()],
      )

      const user = result.rows[0]
      console.log("[v0] User created successfully with ID:", user.id)

      // Generate and store verification code
      console.log("[v0] Generating verification code")
      const verificationCode = this.generateVerificationCode()
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRES)

      await client.query(
        `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, $3)`,
        [user.id, verificationCode, expiresAt],
      )

      // Send verification email
      console.log("[v0] Sending verification email")
      await this.sendVerificationEmail(email, verificationCode)

      console.log("[v0] Registration completed successfully")
      return {
        success: true,
        needsVerification: true,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
        },
      }
    } catch (error) {
      console.error("[v0] Registration error details:", error)

      if (error instanceof z.ZodError) {
        console.log("[v0] Validation error:", error.errors)
        return { success: false, error: error.errors[0].message }
      }

      if (error instanceof Error) {
        if (error.message.includes("connect")) {
          console.error("[v0] Database connection error")
          return { success: false, error: "Database connection failed. Please try again." }
        }
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          console.error("[v0] Database table missing")
          return { success: false, error: "Database not properly configured. Please contact support." }
        }
      }

      console.error("[v0] Unexpected registration error:", error)
      return { success: false, error: "Registration failed. Please try again." }
    } finally {
      if (client) {
        console.log("[v0] Releasing database connection")
        client.release()
      }
    }
  }

  static async login(input: unknown): Promise<AuthResult> {
    const client = await getClient()

    try {
      // Validate input
      const { email, password } = loginSchema.parse(input)

      // Get user
      const result = await client.query(
        `SELECT id, name, email, password_hash, email_verified, created_at 
         FROM users WHERE email = $1`,
        [email.toLowerCase()],
      )

      if (result.rows.length === 0) {
        return { success: false, error: "Invalid email or password" }
      }

      const user = result.rows[0]

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash)
      if (!isValidPassword) {
        return { success: false, error: "Invalid email or password" }
      }

      // Check email verification
      if (!user.email_verified) {
        return {
          success: false,
          error: "Please verify your email address before signing in",
          needsVerification: true,
        }
      }

      // Generate token
      const token = this.generateToken(user.id.toString())

      // Store session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await client.query(
        `INSERT INTO user_sessions (user_id, session_token, expires_at) 
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt],
      )

      return {
        success: true,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
        },
        token,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message }
      }

      console.error("Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    } finally {
      client.release()
    }
  }

  static async verifyEmail(input: unknown): Promise<AuthResult> {
    const client = await getClient()

    try {
      // Validate input
      const { email, code } = verifyEmailSchema.parse(input)

      // Get user and verification token
      const result = await client.query(
        `SELECT u.id, u.name, u.email, u.email_verified, u.created_at, 
                evt.token, evt.expires_at
         FROM users u
         JOIN email_verification_tokens evt ON u.id = evt.user_id
         WHERE u.email = $1 AND evt.token = $2
         ORDER BY evt.created_at DESC
         LIMIT 1`,
        [email.toLowerCase(), code.toUpperCase()],
      )

      if (result.rows.length === 0) {
        return { success: false, error: "Invalid verification code" }
      }

      const user = result.rows[0]

      // Check expiration
      if (new Date() > new Date(user.expires_at)) {
        return { success: false, error: "Verification code has expired" }
      }

      // Mark email as verified
      await client.query("UPDATE users SET email_verified = TRUE WHERE id = $1", [user.id])

      // Clean up verification tokens
      await client.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [user.id])

      return {
        success: true,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: true,
          createdAt: user.created_at,
        },
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message }
      }

      console.error("Email verification error:", error)
      return { success: false, error: "Verification failed. Please try again." }
    } finally {
      client.release()
    }
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const client = await getClient()

    try {
      // Verify JWT
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      // Get user from database
      const result = await client.query(
        `SELECT u.id, u.name, u.email, u.email_verified, u.created_at
         FROM users u
         JOIN user_sessions s ON u.id = s.user_id
         WHERE s.session_token = $1 AND s.expires_at > NOW()`,
        [token],
      )

      if (result.rows.length === 0) return null

      const user = result.rows[0]
      return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      }
    } catch (error) {
      console.error("Get user from token error:", error)
      return null
    } finally {
      client.release()
    }
  }

  static async logout(token: string): Promise<boolean> {
    const client = await getClient()

    try {
      await client.query("DELETE FROM user_sessions WHERE session_token = $1", [token])
      return true
    } catch (error) {
      console.error("Logout error:", error)
      return false
    } finally {
      client.release()
    }
  }

  static async resendVerificationCode(email: string): Promise<AuthResult> {
    const client = await getClient()

    try {
      // Check if user exists and is not verified
      const userResult = await client.query("SELECT id, email_verified FROM users WHERE email = $1", [
        email.toLowerCase(),
      ])

      if (userResult.rows.length === 0) {
        return { success: false, error: "No account found with this email" }
      }

      const user = userResult.rows[0]
      if (user.email_verified) {
        return { success: false, error: "Email is already verified" }
      }

      // Delete old verification tokens
      await client.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [user.id])

      // Generate new verification code
      const verificationCode = this.generateVerificationCode()
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRES)

      await client.query(
        `INSERT INTO email_verification_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, $3)`,
        [user.id, verificationCode, expiresAt],
      )

      // Send verification email
      await this.sendVerificationEmail(email, verificationCode)

      return { success: true }
    } catch (error) {
      console.error("Resend verification error:", error)
      return { success: false, error: "Failed to resend verification code" }
    } finally {
      client.release()
    }
  }
}
