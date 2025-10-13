"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Crown, ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Checkout from "@/components/checkout"

export default function UpgradePage() {
  const [showCheckout, setShowCheckout] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentSuccess = urlParams.get("success") === "true"

    if (paymentSuccess) {
      router.push("/?upgraded=true")
    }
  }, [router])

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
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Complete Your Subscription</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <Checkout productId="premium-monthly" />
            </div>
          </div>
        </div>
      )}

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
              <CardDescription className="text-center">Powered by Stripe - Safe & Secure</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-800 mb-2">Ready to upgrade?</div>
                <p className="text-green-700 text-sm mb-4">
                  Click below to securely subscribe with Stripe. Premium features activate automatically after payment.
                </p>

                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Subscribe for $0.15/month
                </Button>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Secure Stripe payment processing</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Instant premium activation</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Cancel anytime</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  <strong>Automatic Activation:</strong> Your premium features will be activated immediately after
                  successful payment. No manual steps required!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <span>Stripe Secured</span>
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
