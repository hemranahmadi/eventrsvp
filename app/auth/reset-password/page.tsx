"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log("[v0] Reset password page loaded")
      console.log("[v0] Full URL:", window.location.href)
      console.log("[v0] Hash:", window.location.hash)
      console.log("[v0] Search params:", window.location.search)

      // Check if we have tokens in the URL hash (fallback for direct token links)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")
      const type = hashParams.get("type")

      console.log("[v0] Hash params:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        type,
        fullHash: window.location.hash,
      })

      // If we have tokens in the hash, set the session
      if (accessToken && refreshToken) {
        console.log("[v0] Setting session from hash tokens")
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error("[v0] Error setting session:", error)
          setError("Invalid or expired reset link. Please request a new one.")
          setHasValidSession(false)
        } else {
          console.log("[v0] Session set successfully:", data.session?.user?.email)
          setHasValidSession(true)
          // Clear the hash from the URL for security
          window.history.replaceState(null, "", window.location.pathname)
        }
      } else {
        // No tokens in hash, check if we already have a session (from callback route)
        console.log("[v0] No tokens in hash, checking existing session")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("[v0] Session check result:", {
          hasSession: !!session,
          userEmail: session?.user?.email,
        })

        if (!session) {
          console.log("[v0] No valid session found")
          setError("Invalid or expired reset link. Please request a new one.")
          setHasValidSession(false)
        } else {
          console.log("[v0] Valid session found:", session.user?.email)
          setHasValidSession(true)
        }
      }

      setCheckingSession(false)
    }

    handlePasswordReset()
  }, [supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Updating password")
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      console.log("[v0] Password updated successfully")
      setSuccess(true)
      await supabase.auth.signOut()
      setTimeout(() => {
        router.push("/auth/login?message=password_reset_success")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Error updating password:", err)
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">Verifying reset link...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>Your password has been updated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-md">
              Your password has been successfully reset. Redirecting you to login...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasValidSession && error ? (
            <div className="space-y-4">
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
              <Link href="/auth/forgot-password">
                <Button className="w-full">Request New Reset Link</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
