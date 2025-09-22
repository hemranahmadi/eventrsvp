"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getUserEvents, updateEventStatus, deleteEvent } from "@/lib/storage"
import type { Event } from "@/lib/types"
import { Calendar, MapPin, Power, PowerOff, Trash2 } from "lucide-react"

interface EventListProps {
  onSelectEvent: (event: Event) => void
  userId: string
}

export function EventList({ onSelectEvent, userId }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([])

  const loadEvents = () => {
    console.log("[v0] Fetching events for user:", userId)
    const userEvents = getUserEvents(userId)
    console.log("[v0] Found events:", userEvents)
    setEvents(userEvents)
  }

  useEffect(() => {
    loadEvents()
  }, [userId])

  const handleToggleStatus = (eventId: string, currentStatus: boolean) => {
    updateEventStatus(eventId, userId, !currentStatus)
    loadEvents() // Refresh the list
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? This will also delete all RSVPs.")) {
      deleteEvent(eventId, userId)
      loadEvents() // Refresh the list
    }
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
                <div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="mt-2">{event.description}</CardDescription>
                </div>
                <Badge variant={event.active ? "default" : "secondary"}>{event.active ? "Active" : "Inactive"}</Badge>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(event.id, event.active)}
                      className="flex-1"
                    >
                      {event.active ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
