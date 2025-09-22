"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authStorage, emailVerification, type User } from "@/lib/auth"
import { CheckCircle, Mail } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: User) => void
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!isLogin && !formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (isLogin) {
      const user = authStorage.login(formData.email, formData.password)
      if (user) {
        if (!user.isEmailVerified) {
          setError("Please verify your email address before signing in. Check your inbox for the verification code.")
          setShowVerification(true)
          setVerificationEmail(formData.email)
          return
        }
        onLogin(user)
        onClose()
      } else {
        setError("Invalid email or password")
      }
    } else {
      if (!formData.name.trim()) {
        setError("Name is required")
        return
      }

      const result = authStorage.register(formData.name, formData.email, formData.password)
      if (result.success) {
        setSuccess("Account created! Please check your email for a verification code.")
        setShowVerification(true)
        setVerificationEmail(formData.email)
      } else {
        setError(result.error || "Registration failed")
      }
    }
  }

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (emailVerification.verifyCode(verificationEmail, verificationCode)) {
      setSuccess("Email verified successfully! You can now sign in.")
      setShowVerification(false)
      setIsLogin(true)
      setVerificationCode("")
      setFormData({ name: "", email: verificationEmail, password: "" })
    } else {
      setError("Invalid or expired verification code. Please try again.")
    }
  }

  const handleBypassVerification = () => {
    // Force verify the email for testing purposes
    emailVerification.verifyCode(verificationEmail, "BYPASS")
    setSuccess("Email verification bypassed for testing! You can now sign in.")
    setShowVerification(false)
    setIsLogin(true)
    setVerificationCode("")
    setFormData({ name: "", email: verificationEmail, password: "" })
  }

  const handleResendCode = () => {
    const newCode = emailVerification.generateVerificationCode()
    if (emailVerification.sendVerificationEmail(verificationEmail, newCode)) {
      setSuccess("New verification code sent to your email!")
      setError("")
    }
  }

  if (showVerification) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification code to
              <br />
              <strong>{verificationEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Verify Email
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <button type="button" onClick={handleResendCode} className="text-sm text-blue-600 hover:underline">
                Didn't receive the code? Resend
              </button>
            </div>
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={handleBypassVerification}
                className="text-sm text-orange-600 hover:underline"
              >
                Skip verification (Testing only)
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">Check your spam folder if you don't see the email</p>
              <p className="text-xs text-orange-500 mt-1">
                Note: Email system ready for production. Currently simulated for testing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to manage your events" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          {!isLogin && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                You'll receive a verification email with a 6-digit code. Real email addresses only.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
