"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authStorage, type User } from "@/lib/auth"
import { ArrowLeft, UserIcon, Crown, CreditCard, AlertTriangle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const existingUser = authStorage.getUser()
    if (!existingUser) {
      router.push("/")
      return
    }

    setUser(existingUser)
    setName(existingUser.name)
    setEmail(existingUser.email)

    const premiumStatus = localStorage.getItem("user_premium") === "true"
    setIsPremium(premiumStatus)
  }, [router])

  const handleUpdateAccount = () => {
    if (!user) return

    const updatedUser = { ...user, name, email }
    authStorage.setUser(updatedUser)
    setUser(updatedUser)

    toast({
      title: "Account Updated",
      description: "Your account information has been saved successfully.",
    })
  }

  const handleCancelSubscription = () => {
    localStorage.removeItem("user_premium")
    localStorage.removeItem("payment_attempted")
    setIsPremium(false)
    setShowCancelConfirm(false)

    toast({
      title: "Subscription Cancelled",
      description:
        "Your premium subscription has been cancelled. You'll retain access until the end of your billing period.",
    })
  }

  const handleManageSubscription = () => {
    window.open("https://square.link/u/khqXjy2h", "_blank")
  }

  const handleUpgrade = () => {
    setShowPaymentModal(true)

    setTimeout(() => {
      if (showPaymentModal) {
        localStorage.setItem("user_premium", "true")
        setIsPremium(true)
        setShowPaymentModal(false)
        toast({
          title: "Payment Successful!",
          description: "Welcome to Premium! All features are now unlocked.",
        })
      }
    }, 30000)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your account and subscription</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Update your personal information and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
              <Button onClick={handleUpdateAccount} className="w-full">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your premium subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {isPremium ? (
                    <>
                      <Crown className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">Premium Plan</p>
                        <p className="text-sm text-muted-foreground">$0.15/month</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-sm text-muted-foreground">Basic features only</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {isPremium ? (
                    <>
                      <Button variant="outline" onClick={handleManageSubscription}>
                        Manage Billing
                      </Button>
                      <Button variant="destructive" onClick={() => setShowCancelConfirm(true)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleUpgrade}>Upgrade to Premium</Button>
                  )}
                </div>
              </div>

              {isPremium && (
                <div className="space-y-3">
                  <h4 className="font-medium">Premium Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Detailed attendance analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Advanced guest management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Response rate tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Export guest lists
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cancel Subscription Confirmation */}
          {showCancelConfirm && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Cancel Subscription
                </CardTitle>
                <CardDescription>Are you sure you want to cancel your premium subscription?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm">
                    <strong>What happens when you cancel:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• You'll lose access to premium analytics</li>
                    <li>• Advanced guest management will be disabled</li>
                    <li>• You can resubscribe anytime</li>
                    <li>• Your event data will be preserved</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleCancelSubscription} className="flex-1">
                    Yes, Cancel Subscription
                  </Button>
                  <Button variant="outline" onClick={() => setShowCancelConfirm(false)} className="flex-1">
                    Keep Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Embedded Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <iframe
              src="https://square.link/u/khqXjy2h"
              className="w-full h-[calc(100%-60px)] border-0"
              title="Square Payment"
            />
          </div>
        </div>
      )}
    </div>
  )
}
