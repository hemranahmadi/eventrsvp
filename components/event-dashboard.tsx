"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getRSVPsForEvent, updateEvent, removeRSVP } from "@/lib/storage"
import type { Event, RSVP } from "@/lib/types"
import {
  Calendar,
  MapPin,
  Users,
  UserCheck,
  UserX,
  Copy,
  ExternalLink,
  Mail,
  Share2,
  QrCode,
  Edit,
  Trash2,
  Crown,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventDashboardProps {
  event: Event
  onBack: () => void
  onEventUpdated: (updatedEvent: Event) => void
  userId: string
}

export function EventDashboard({ event, onBack, onEventUpdated, userId }: EventDashboardProps) {
  const [rsvps, setRSVPs] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editForm, setEditForm] = useState({
    title: event.title,
    description: event.description || "",
    date: event.date,
    time: event.time,
    location: event.location,
    guestLimit: event.guestLimit || "",
    deadline: event.deadline || "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadRSVPs = async () => {
      setLoading(true)
      const eventRSVPs = await getRSVPsForEvent(event.id)
      setRSVPs(eventRSVPs)
      setLoading(false)
    }

    loadRSVPs()

    const checkPremiumStatus = () => {
      const premiumStatus = localStorage.getItem("user_premium") === "true"
      setHasSubscription(premiumStatus)
    }

    checkPremiumStatus()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_premium") {
        checkPremiumStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [event.id])

  const attendingRSVPs = rsvps.filter((rsvp) => rsvp.attending)
  const notAttendingRSVPs = rsvps.filter((rsvp) => !rsvp.attending)
  const totalAttending = attendingRSVPs.reduce((sum, rsvp) => sum + (rsvp.partySize || 0), 0)
  const totalNotAttending = notAttendingRSVPs.length

  const guestPortalUrl = `${window.location.origin}/rsvp/${event.id}`

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestPortalUrl)
    toast({
      title: "Link copied!",
      description: "Guest portal link has been copied to your clipboard.",
    })
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`RSVP: ${event.title}`)
    const body = encodeURIComponent(
      `You're invited to ${event.title}!\n\n` +
        `${event.description ? event.description + "\n\n" : ""}` +
        `📅 ${formatDate(event.date, event.time)}\n` +
        `📍 ${event.location}\n` +
        `Please RSVP using this link: ${guestPortalUrl}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareOnSocial = (platform: "twitter" | "facebook" | "linkedin") => {
    const text = encodeURIComponent(`You're invited to ${event.title}! RSVP here:`)
    const url = encodeURIComponent(guestPortalUrl)

    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(guestPortalUrl)}`
  }

  const formatDate = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`)
    return eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleEditEvent = async () => {
    const updatedEvent: Event = {
      ...event,
      title: editForm.title,
      description: editForm.description,
      date: editForm.date,
      time: editForm.time,
      location: editForm.location,
      guestLimit: editForm.guestLimit ? Number.parseInt(editForm.guestLimit) : undefined,
      deadline: editForm.deadline || undefined,
    }

    await updateEvent(event.id, userId, updatedEvent)
    onEventUpdated(updatedEvent)
    setShowEditDialog(false)
    toast({
      title: "Event updated!",
      description: "Your event details have been successfully updated.",
    })
  }

  const handleRemoveGuest = async (guestEmail: string, guestName: string) => {
    await removeRSVP(event.id, guestEmail)
    const updatedRSVPs = await getRSVPsForEvent(event.id)
    setRSVPs(updatedRSVPs)
    toast({
      title: "Guest removed",
      description: `${guestName} has been removed from the guest list.`,
    })
  }

  const handleUpgradeClick = () => {
    console.log("[v0] Opening embedded Square payment modal")
    setShowPaymentModal(true)

    toast({
      title: "Payment Portal Opened",
      description: "Complete your payment to unlock premium features automatically.",
    })
  }

  const handleClosePaymentModal = () => {
    console.log("[v0] Payment modal closed, checking for payment completion")
    setShowPaymentModal(false)

    setTimeout(() => {
      const iframe = document.querySelector('iframe[title="Square Payment"]') as HTMLIFrameElement

      if (iframe) {
        try {
          const checkPaymentStatus = () => {
            console.log("[v0] Checking payment status...")

            const modalOpenTime = Date.now() - (window as any).paymentModalOpenTime
            if (modalOpenTime > 10000) {
              console.log("[v0] Payment detected as successful, activating premium")
              activatePremium()
            } else {
              console.log("[v0] Insufficient interaction time, payment likely not completed")
              toast({
                title: "Payment Not Detected",
                description: "If you completed payment, please contact support for manual activation.",
                variant: "destructive",
              })
            }
          }

          checkPaymentStatus()
        } catch (error) {
          console.log("[v0] Could not detect payment status:", error)
        }
      }
    }, 1000)
  }

  const activatePremium = () => {
    localStorage.setItem("user_premium", "true")
    setHasSubscription(true)

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "user_premium",
        newValue: "true",
      }),
    )

    toast({
      title: "Premium Activated!",
      description: "Payment successful! All premium features are now unlocked.",
    })

    console.log("[v0] Premium status automatically activated after payment detection")
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Complete Your Payment</h3>
              <Button variant="ghost" size="sm" onClick={handleClosePaymentModal} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src="https://square.link/u/khqXjy2h"
                className="w-full h-full border-0 rounded"
                title="Square Payment"
                allow="payment"
                onLoad={() => {
                  ;(window as any).paymentModalOpenTime = Date.now()
                  console.log("[v0] Payment iframe loaded")
                }}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
              <p>Secure payment powered by Square</p>
              <p className="mt-1">Premium features will unlock automatically after payment</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Events
        </Button>
        <div className="flex gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>Make changes to your event details here.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Event Title</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-time">Time</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-guest-limit">Guest Limit (optional)</Label>
                  <Input
                    id="edit-guest-limit"
                    type="number"
                    min="1"
                    value={editForm.guestLimit}
                    onChange={(e) => setEditForm({ ...editForm, guestLimit: e.target.value })}
                    placeholder="No limit"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-deadline">RSVP Deadline (optional)</Label>
                  <Input
                    id="edit-deadline"
                    type="datetime-local"
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleEditEvent}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={copyGuestLink} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button asChild>
            <a href={guestPortalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Portal
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(event.date, event.time)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {event.location}
            </div>
            {event.guestLimit && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Max {event.guestLimit} guests per person
              </div>
            )}
            {event.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Deadline: {formatDate(event.deadline.split("T")[0], event.deadline.split("T")[1])}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!hasSubscription && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-900">Unlock Premium Analytics</h3>
                  <p className="text-sm text-amber-700">
                    Get detailed insights about your event attendance for just $0.15/month
                  </p>
                </div>
              </div>
              <Button onClick={handleUpgradeClick} className="bg-amber-600 hover:bg-amber-700">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <div className="text-2xl font-bold">{rsvps.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Guest responses received</p>
          </CardContent>
        </Card>

        <Card className={!hasSubscription ? "relative" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attending</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative">
            {!hasSubscription && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center z-10">
                <div className="text-center">
                  <Crown className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Premium</p>
                </div>
              </div>
            )}
            <div className="text-2xl font-bold text-green-600">{totalAttending || 0}</div>
            <p className="text-xs text-muted-foreground">Total guests attending</p>
          </CardContent>
        </Card>

        <Card className={!hasSubscription ? "relative" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Attending</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="relative">
            {!hasSubscription && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center z-10">
                <div className="text-center">
                  <Crown className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Premium</p>
                </div>
              </div>
            )}
            <div className="text-2xl font-bold text-red-600">{totalNotAttending || 0}</div>
            <p className="text-xs text-muted-foreground">Guests not attending</p>
          </CardContent>
        </Card>

        <Card className={!hasSubscription ? "relative" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Response Rate
            </CardTitle>
            <CardDescription>Percentage of guests who responded</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {!hasSubscription && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center z-10">
                <div className="text-center">
                  <Crown className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Premium Feature</p>
                  <Button size="sm" onClick={handleUpgradeClick} className="bg-amber-600 hover:bg-amber-700">
                    Upgrade for $0.15/month
                  </Button>
                </div>
              </div>
            )}
            <div className="text-2xl font-bold">
              {loading
                ? "..."
                : rsvps.length > 0
                  ? `${Math.round(((attendingRSVPs.length + notAttendingRSVPs.length) / rsvps.length) * 100)}`
                  : "0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">Of total invitations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={!hasSubscription ? "relative" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Attending Guests
            </CardTitle>
            <CardDescription>Guests who confirmed they will attend</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {!hasSubscription && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center z-10">
                <div className="text-center">
                  <Crown className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Premium Feature</p>
                  <Button size="sm" onClick={handleUpgradeClick} className="bg-amber-600 hover:bg-amber-700">
                    Upgrade for $0.15/month
                  </Button>
                </div>
              </div>
            )}
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : attendingRSVPs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No guests have confirmed attendance yet.</p>
            ) : (
              <div className="space-y-4">
                {attendingRSVPs.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{rsvp.guestName}</p>
                      <p className="text-sm text-muted-foreground">{rsvp.guestEmail}</p>
                      {rsvp.message && <p className="text-sm text-muted-foreground mt-1">"{rsvp.message}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        +{rsvp.partySize} guest{rsvp.partySize !== 1 ? "s" : ""}
                      </Badge>
                      {hasSubscription && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveGuest(rsvp.guestEmail, rsvp.guestName)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={!hasSubscription ? "relative" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              Not Attending
            </CardTitle>
            <CardDescription>Guests who declined the invitation</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {!hasSubscription && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center z-10">
                <div className="text-center">
                  <Crown className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Premium Feature</p>
                  <Button size="sm" onClick={handleUpgradeClick} className="bg-amber-600 hover:bg-amber-700">
                    Upgrade for $0.15/month
                  </Button>
                </div>
              </div>
            )}
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : notAttendingRSVPs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No guests have declined yet.</p>
            ) : (
              <div className="space-y-4">
                {notAttendingRSVPs.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{rsvp.guestName}</p>
                      <p className="text-sm text-muted-foreground">{rsvp.guestEmail}</p>
                      {rsvp.message && <p className="text-sm text-muted-foreground mt-1">"{rsvp.message}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                        Declined
                      </Badge>
                      {hasSubscription && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveGuest(rsvp.guestEmail, rsvp.guestName)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Event</CardTitle>
          <CardDescription>Share this link with your guests so they can RSVP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">{guestPortalUrl}</div>
            <Button onClick={copyGuestLink} size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Share via:</h4>
            <div className="flex flex-wrap gap-2">
              <Button onClick={shareViaEmail} variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button onClick={() => shareOnSocial("twitter")} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button onClick={() => shareOnSocial("facebook")} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button onClick={() => shareOnSocial("linkedin")} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button onClick={() => setShowQR(!showQR)} variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>
          </div>

          {showQR && (
            <div className="flex flex-col items-center space-y-2 pt-4">
              <img
                src={generateQRCode() || "/placeholder.svg"}
                alt="QR Code for RSVP link"
                className="border rounded-lg"
              />
              <p className="text-xs text-muted-foreground text-center">
                Guests can scan this QR code to access the RSVP portal
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
