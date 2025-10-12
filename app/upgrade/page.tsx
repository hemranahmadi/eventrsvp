"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Crown, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UpgradePage() {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showActivation, setShowActivation] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [hasAttemptedPayment, setHasAttemptedPayment] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Checking URL parameters and payment attempts")
    const urlParams = new URLSearchParams(window.location.search)
    const paymentCompleted = urlParams.get("payment") === "completed"
    const attemptedPayment = localStorage.getItem("attempted_payment") === "true"

    console.log("[v0] Payment completed from URL:", paymentCompleted)
    console.log("[v0] Attempted payment from storage:", attemptedPayment)

    if (paymentCompleted || attemptedPayment) {
      setShowActivation(true)
      setHasAttemptedPayment(true)
    }
  }, [])

  const handleUpgrade = () => {
    console.log("[v0] Starting upgrade process")
    setIsRedirecting(true)

    localStorage.setItem("attempted_payment", "true")
    setHasAttemptedPayment(true)

    window.open("https://square.link/u/wbf4KIie", "_blank")

    setTimeout(() => {
      console.log("[v0] Showing activation after timeout")
      setIsRedirecting(false)
      setShowActivation(true)
    }, 3000)
  }

  const handleActivatePremium = () => {
    console.log("[v0] Activating premium features")
    setIsActivating(true)

    // Get current user
    const currentUser = localStorage.getItem("current_user")
    console.log("[v0] Current user:", currentUser)

    if (currentUser) {
      const user = JSON.parse(currentUser)
      console.log("[v0] Setting premium for user:", user.id)

      // Set premium status
      localStorage.setItem("premium_user", user.id)

      localStorage.removeItem("attempted_payment")

      setTimeout(() => {
        console.log("[v0] Redirecting to dashboard")
        setIsActivating(false)
        // Redirect back to dashboard with success message
        router.push("/?upgraded=true")
      }, 1500)
    } else {
      console.log("[v0] No current user found")
      setIsActivating(false)
    }
  }

  const handleShowActivation = () => {
    console.log("[v0] Manually showing activation")
    setShowActivation(true)
    setHasAttemptedPayment(true)
    localStorage.setItem("attempted_payment", "true")
  }

  const features = [
    "View detailed attendance analytics",
    "See response rates and trends",
    "Access attending guests list",
    "View not attending guests list",
    "Remove guests from events",
    "Export guest lists",
    "Priority customer support",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Upgrade to Premium</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock powerful analytics and guest management features to make your events even better
          </p>
        </div>

        {!showActivation && (
          <Card className="border-2 border-yellow-200 mb-8 bg-yellow-50">
            <CardContent className="text-center py-6">
              <p className="text-yellow-800 mb-4">
                Already completed your payment? Click below to activate your premium features.
              </p>
              <Button
                onClick={handleShowActivation}
                variant="outline"
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 bg-transparent"
              >
                I've Completed Payment - Activate Now
              </Button>
            </CardContent>
          </Card>
        )}

        {showActivation && (
          <Card className="border-2 border-green-200 mb-8 bg-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-center">Premium Features</CardTitle>
              <CardDescription className="text-center">Everything you need to manage successful events</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handleActivatePremium}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                disabled={isActivating}
              >
                {isActivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Activating Premium...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Activate Premium Features
                  </>
                )}
              </Button>
              <p className="text-sm text-green-600 mt-3">
                Only click this after you've successfully completed your payment on Square
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Features Card */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Premium Features</CardTitle>
              <CardDescription className="text-center">Everything you need to manage successful events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}

              <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">$0.15</div>
                <div className="text-gray-600">per month</div>
                <div className="text-sm text-gray-500 mt-1">Cancel anytime</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Secure Payment</CardTitle>
              <CardDescription className="text-center">Powered by Square - Safe & Secure</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-800 mb-2">Ready to upgrade?</div>
                <p className="text-green-700 text-sm mb-4">
                  Click below to securely pay with Square. After payment, return here to activate your premium features.
                </p>

                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg"
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <Crown className="h-5 w-5 mr-2" />
                      Subscribe for $0.15/month
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Secure Square payment processing</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Return here after payment to activate</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Cancel Anytime</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  <strong>Important:</strong> After completing payment on Square, return to this page and click
                  "Activate Premium Features" to unlock your premium analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <span>Square Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Check className="h-4 w-4 text-blue-500" />
              </div>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
