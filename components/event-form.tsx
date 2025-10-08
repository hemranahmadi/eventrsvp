"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveEvent } from "@/lib/storage"
import type { Event } from "@/lib/types"

interface EventFormProps {
  onEventCreated: (event: Event) => void
  userId: string
  userName?: string
  userEmail?: string
}

export function EventForm({
  onEventCreated,
  userId,
  userName = "Event Host",
  userEmail = "host@example.com",
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    guestLimit: "", // Added guest limit to form state
    deadline: "", // Added deadline field to form state
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      alert("Please sign in to create events")
      return
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      guest_limit: formData.guestLimit ? Number.parseInt(formData.guestLimit) : undefined,
      rsvp_deadline: formData.deadline || undefined, // Changed from 'deadline' to 'rsvp_deadline'
      host_name: userName,
      host_email: userEmail,
    }

    const event = await saveEvent(eventData, userId)

    if (event) {
      onEventCreated(event)
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        guestLimit: "",
        deadline: "",
      })
    } else {
      alert("Failed to create event. Please try again.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Fill out the details below to create your event and start collecting RSVPs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Birthday Party, Wedding, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="123 Main St, City, State"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell your guests about the event..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestLimit">Guest Limit (Optional)</Label>
            <Input
              id="guestLimit"
              name="guestLimit"
              type="number"
              min="1"
              value={formData.guestLimit}
              onChange={handleChange}
              placeholder="Maximum guests per person (leave empty for no limit)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">RSVP Deadline (Optional)</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              placeholder="Last date for RSVPs"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Event
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
