"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("[v0] Starting sign up process for:", email)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (signUpError) {
        console.error("[v0] Sign up error:", signUpError)
        throw signUpError
      }

      console.log("[v0] Sign up successful, user ID:", signUpData.user?.id)

      if (signUpData.user?.id) {
        try {
          const { error: profileError } = await supabase.from("user_profiles").insert({
            id: signUpData.user.id,
            subscription_status: "free",
            is_premium: false,
          })

          if (profileError) {
            console.error("[v0] Profile creation error:", profileError)
            // Don't throw - let user continue even if profile creation fails
          } else {
            console.log("[v0] User profile created successfully")
          }
        } catch (profileErr) {
          console.error("[v0] Profile creation failed:", profileErr)
          // Don't throw - let user continue
        }
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (otpError) {
        console.log("[v0] OTP send error:", otpError)
      }

      console.log("[v0] Redirecting to verification page")
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      console.error("[v0] Sign up error:", err)

      let errorMessage = "Failed to sign up"

      if (err.message?.includes("already registered")) {
        errorMessage = "An account with this email already exists"
      } else if (err.message?.includes("invalid email")) {
        errorMessage = "Please enter a valid email address"
      } else if (err.message?.includes("password")) {
        errorMessage = "Password must be at least 6 characters"
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up to start creating and managing events</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
