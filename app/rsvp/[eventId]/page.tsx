"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEvent, saveRSVP, getRSVPsForEvent } from "@/lib/storage"
import type { Event, RSVP } from "@/lib/types"
import { Calendar, MapPin, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RSVPPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [existingRSVP, setExistingRSVP] = useState<RSVP | null>(null)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    attending: "",
    partySize: "1",
  })

  useEffect(() => {
    const loadEventData = async () => {
      setLoading(true)
      const eventData = await getEvent(eventId)
      setEvent(eventData)

      if (eventData?.deadline) {
        const deadlineDate = new Date(eventData.deadline)
        const now = new Date()
        setIsDeadlinePassed(now > deadlineDate)
      }

      const rsvps = await getRSVPsForEvent(eventId)
      const existingEmail = localStorage.getItem(`rsvp-email-${eventId}`)
      if (existingEmail) {
        const existing = rsvps.find((r) => r.guest_email === existingEmail)
        if (existing) {
          setExistingRSVP(existing)
          setFormData({
            guestName: existing.guest_name,
            guestEmail: existing.guest_email,
            attending: existing.attending ? "yes" : "no",
            partySize: existing.party_size.toString(),
          })
        }
      }

      setLoading(false)
    }

    loadEventData()
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!event) return

    const rsvpData = {
      event_id: event.id,
      guest_name: formData.guestName,
      guest_email: formData.guestEmail,
      attending: formData.attending === "yes",
      party_size: Number.parseInt(formData.partySize),
      message: "",
    }

    await saveRSVP(rsvpData)
    localStorage.setItem(`rsvp-email-${eventId}`, formData.guestEmail)
    setSubmitted(true)

    toast({
      title: "RSVP Submitted!",
      description: existingRSVP ? "Your RSVP has been updated." : "Thank you for your response.",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    return deadlineDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Event Not Found</h3>
            <p className="text-muted-foreground text-center">
              The event you're looking for doesn't exist or may have been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isDeadlinePassed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">RSVP Deadline Passed</h3>
            <p className="text-muted-foreground text-center mb-4">
              The RSVP deadline for this event has passed and responses are no longer being accepted.
            </p>
            {event.deadline && (
              <p className="text-sm text-muted-foreground text-center">
                Deadline was: {formatDeadline(event.deadline)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">RSVP Submitted!</h3>
            <p className="text-muted-foreground text-center mb-4">
              {existingRSVP ? "Your RSVP has been updated." : "Thank you for your response."}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              You can update your RSVP anytime by visiting this link again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(event.date, event.time)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {event.location}
                </div>
                {event.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    RSVP by: {formatDeadline(event.deadline)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* RSVP Form */}
          <Card>
            <CardHeader>
              <CardTitle>{existingRSVP ? "Update Your RSVP" : "RSVP to This Event"}</CardTitle>
              <CardDescription>
                {existingRSVP
                  ? "You can update your response below."
                  : "Please let us know if you'll be able to attend."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestName">Your Name *</Label>
                    <Input
                      id="guestName"
                      value={formData.guestName}
                      onChange={(e) => handleChange("guestName", e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestEmail">Your Email *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => handleChange("guestEmail", e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Will you be attending? *</Label>
                  <RadioGroup
                    value={formData.attending}
                    onValueChange={(value) => handleChange("attending", value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes, I'll be there!</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">Sorry, can't make it</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.attending === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="partySize">How many people will attend? (Including yourself) *</Label>
                    {event.guest_limit && (
                      <p className="text-sm text-muted-foreground">Maximum {event.guest_limit} guests per person</p>
                    )}
                    <Select value={formData.partySize} onValueChange={(value) => handleChange("partySize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select party size" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: event.guest_limit || 10 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "guest" : "guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={!formData.attending}>
                  {existingRSVP ? "Update RSVP" : "Submit RSVP"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
