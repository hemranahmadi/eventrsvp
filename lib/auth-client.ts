"use client"

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
  error?: string
  needsVerification?: boolean
}

export class AuthClient {
  static async register(name: string, email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Network error" }
    }
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error" }
    }
  }

  static async verifyEmail(email: string, code: string): Promise<AuthResult> {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Email verification error:", error)
      return { success: false, error: "Network error" }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/auth/me")

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  static async logout(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      return response.ok
    } catch (error) {
      console.error("Logout error:", error)
      return false
    }
  }
}
