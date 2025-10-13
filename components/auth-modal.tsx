"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = "login" | "register"

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" })

  if (!isOpen) return null

  const resetForm = () => {
    setError("")
    setSuccess("")
    setLoginData({ email: "", password: "" })
    setRegisterData({ name: "", email: "", password: "" })
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) throw error

      setSuccess("Successfully signed in!")
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("[v0] Starting registration for:", registerData.email)

      const supabase = createClient()

      console.log("[v0] Calling supabase.auth.signUp...")
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (signUpError) {
        console.error("[v0] SignUp error details:", signUpError)
        throw signUpError
      }

      console.log("[v0] SignUp successful, user ID:", data.user?.id)

      if (data.user?.id) {
        console.log("[v0] Creating user profile via RPC...")
        try {
          const { data: profileData, error: profileError } = await supabase.rpc("create_user_profile", {
            p_user_id: data.user.id,
          })

          if (profileError) {
            console.error("[v0] Profile creation error:", profileError)
          } else {
            console.log("[v0] User profile created successfully:", profileData)
          }
        } catch (profileErr) {
          console.error("[v0] Profile creation exception:", profileErr)
        }
      }

      console.log("[v0] Sending verification email...")
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: registerData.email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (otpError) {
        console.log("[v0] OTP send error:", otpError)
      }

      console.log("[v0] Registration complete, redirecting to verify page")
      onClose()
      router.push(`/auth/verify?email=${encodeURIComponent(registerData.email)}`)
    } catch (err: any) {
      console.error("[v0] Registration exception:", err)

      let errorMessage = "Registration failed"

      if (err.message?.includes("already registered") || err.message?.includes("already been registered")) {
        errorMessage = "An account with this email already exists"
      } else if (err.message?.includes("invalid email")) {
        errorMessage = "Please enter a valid email address"
      } else if (err.message?.includes("Password")) {
        errorMessage = err.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderLoginForm = () => (
    <Card className="w-full max-w-md mx-4">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Welcome back! Sign in to manage your events.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              router.push("/auth/forgot-password")
            }}
            className="text-sm text-blue-600 hover:underline block w-full"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className="text-sm text-blue-600 hover:underline block w-full"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  )

  const renderRegisterForm = () => (
    <Card className="w-full max-w-md mx-4">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join EventRSVP to start managing your events.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-name">Full Name</Label>
            <Input
              id="register-name"
              type="text"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              placeholder="Create a password (min. 6 characters)"
              required
              minLength={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button type="button" onClick={() => switchMode("login")} className="text-sm text-blue-600 hover:underline">
            Already have an account? Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {mode === "login" && renderLoginForm()}
      {mode === "register" && renderRegisterForm()}
    </div>
  )
}
