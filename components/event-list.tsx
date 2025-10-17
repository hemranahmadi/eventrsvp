"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserEvents, deleteEvent } from "@/lib/storage"
import type { Event } from "@/lib/types"
import { Calendar, MapPin, Trash2 } from "lucide-react"

interface EventListProps {
  onSelectEvent: (event: Event) => void
  userId: string
}

export function EventList({ onSelectEvent, userId }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = async () => {
    setLoading(true)
    const userEvents = await getUserEvents(userId)
    setEvents(userEvents)
    setLoading(false)
  }

  useEffect(() => {
    loadEvents()
  }, [userId])

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? This will also delete all RSVPs.")) {
      await deleteEvent(eventId, userId)
      loadEvents()
    }
  }

  const formatDate = (date: string, time: string) => {
    if (!date || !time) {
      return "Invalid Date"
    }

    try {
      // The database returns dates like "2025-10-18T00:00:00+00:00"
      // We need to extract just "2025-10-18" and parse it in local timezone
      const dateOnly = date.split("T")[0] // Get "2025-10-18"
      const [year, month, day] = dateOnly.split("-").map(Number)
      const [hours, minutes] = time.split(":").map(Number)

      // Create date in LOCAL timezone (month is 0-indexed)
      const dateObj = new Date(year, month - 1, day, hours, minutes)

      if (isNaN(dateObj.getTime())) {
        console.error("[v0] Invalid date object created from:", { date, time, year, month, day, hours, minutes })
        return "Invalid Date"
      }

      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("[v0] Error formatting date:", error, { date, time })
      return "Invalid Date"
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading your events...</p>
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground text-center">
            Create your first event to start collecting RSVPs from your guests.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-6">Your Events</h2>
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="mt-2">{event.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.date, event.time)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="pt-4 space-y-2">
                  <Button onClick={() => onSelectEvent(event)} className="w-full">
                    View Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
