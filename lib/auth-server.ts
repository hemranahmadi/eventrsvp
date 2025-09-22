import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "./db"

export interface User {
  id: number
  name: string
  email: string
  email_verified: boolean
  created_at: string
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
  needsVerification?: boolean
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
  }

  static verifyToken(token: string): { userId: number } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: number }
    } catch {
      return null
    }
  }

  static generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  static async register(name: string, email: string, password: string): Promise<AuthResult> {
    const client = await pool.connect()

    try {
      // Check if user already exists
      const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [email])
      if (existingUser.rows.length > 0) {
        return { success: false, error: "User with this email already exists" }
      }

      // Validate password
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long" }
      }

      // Hash password
      const passwordHash = await this.hashPassword(password)

      // Create user
      const result = await client.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, email_verified, created_at",
        [name, email, passwordHash],
      )

      const user = result.rows[0]

      // Generate verification code
      const verificationCode = this.generateVerificationCode()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      await client.query("INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [
        user.id,
        verificationCode,
        expiresAt,
      ])

      // TODO: Send real verification email here
      console.log(`[EMAIL] Verification code for ${email}: ${verificationCode}`)

      return {
        success: true,
        needsVerification: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          created_at: user.created_at,
        },
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Registration failed" }
    } finally {
      client.release()
    }
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    const client = await pool.connect()

    try {
      // Get user
      const result = await client.query(
        "SELECT id, name, email, password_hash, email_verified, created_at FROM users WHERE email = $1",
        [email],
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

      // Check if email is verified
      if (!user.email_verified) {
        return { success: false, error: "Please verify your email address before signing in", needsVerification: true }
      }

      // Generate JWT token
      const token = this.generateToken(user.id)

      // Store session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await client.query("INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)", [
        user.id,
        token,
        expiresAt,
      ])

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          created_at: user.created_at,
        },
        token,
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Login failed" }
    } finally {
      client.release()
    }
  }

  static async verifyEmail(email: string, code: string): Promise<AuthResult> {
    const client = await pool.connect()

    try {
      // Get user and verification token
      const result = await client.query(
        `
        SELECT u.id, u.name, u.email, u.email_verified, u.created_at, evt.token, evt.expires_at
        FROM users u
        JOIN email_verification_tokens evt ON u.id = evt.user_id
        WHERE u.email = $1 AND evt.token = $2
        ORDER BY evt.created_at DESC
        LIMIT 1
      `,
        [email, code],
      )

      if (result.rows.length === 0) {
        return { success: false, error: "Invalid verification code" }
      }

      const user = result.rows[0]

      // Check if token is expired
      if (new Date() > new Date(user.expires_at)) {
        return { success: false, error: "Verification code has expired" }
      }

      // Mark email as verified
      await client.query("UPDATE users SET email_verified = TRUE WHERE id = $1", [user.id])

      // Delete used verification token
      await client.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [user.id])

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: true,
          created_at: user.created_at,
        },
      }
    } catch (error) {
      console.error("Email verification error:", error)
      return { success: false, error: "Verification failed" }
    } finally {
      client.release()
    }
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const client = await pool.connect()

    try {
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      const result = await client.query(
        "SELECT u.id, u.name, u.email, u.email_verified, u.created_at FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.session_token = $1 AND s.expires_at > NOW()",
        [token],
      )

      if (result.rows.length === 0) return null

      return result.rows[0]
    } catch (error) {
      console.error("Get user from token error:", error)
      return null
    } finally {
      client.release()
    }
  }

  static async logout(token: string): Promise<boolean> {
    const client = await pool.connect()

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
}
