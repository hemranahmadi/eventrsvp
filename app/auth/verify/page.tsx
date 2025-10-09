"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (!email) {
      router.push("/auth/sign-up")
    }
  }, [email, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email!,
        token: code,
        type: "email",
      })

      if (error) throw error

      // Verification successful, redirect to home
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setError("")

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email!,
      })

      if (error) throw error

      alert("Verification code resent! Check your email.")
    } catch (err: any) {
      setError(err.message || "Failed to resend code")
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below to verify your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {resending ? "Resending..." : "Didn't receive the code? Resend"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
