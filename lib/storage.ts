import type { Event, RSVP } from "./types"

// Event storage functions
export function saveEvent(event: Event, userId: string): void {
  const events = getEvents(userId)
  events.push(event)
  localStorage.setItem(`events_${userId}`, JSON.stringify(events))
}

export function getEvents(userId?: string): Event[] {
  if (typeof window === "undefined") return []
  if (!userId) return []

  checkAndDeactivateExpiredEvents(userId)

  const events = localStorage.getItem(`events_${userId}`)
  return events ? JSON.parse(events) : []
}

export function getUserEvents(userId: string): Event[] {
  return getEvents(userId)
}

export function getEvent(id: string, userId?: string): Event | null {
  if (typeof window === "undefined") return null

  if (!userId) {
    // Search through all users' events to find the event (for guest portal access)
    const allUserKeys = Object.keys(localStorage).filter((key) => key.startsWith("events_"))
    for (const key of allUserKeys) {
      try {
        const events = JSON.parse(localStorage.getItem(key) || "[]")
        const event = events.find((event: Event) => event.id === id)
        if (event) {
          if (event.deadline && event.active) {
            const deadlineDate = new Date(event.deadline)
            const now = new Date()
            if (now > deadlineDate) {
              event.active = false
              // Update the event in storage
              const userIdFromKey = key.replace("events_", "")
              updateEventStatus(event.id, userIdFromKey, false)
            }
          }
          return event
        }
      } catch (error) {
        console.error("Error parsing events from localStorage:", error)
      }
    }
    return null
  }

  const events = getEvents(userId)
  return events.find((event) => event.id === id) || null
}

export function updateEventStatus(eventId: string, userId: string, active: boolean): void {
  const events = JSON.parse(localStorage.getItem(`events_${userId}`) || "[]")
  const eventIndex = events.findIndex((event: Event) => event.id === eventId)
  if (eventIndex !== -1) {
    events[eventIndex].active = active
    localStorage.setItem(`events_${userId}`, JSON.stringify(events))
  }
}

export function deleteEvent(eventId: string, userId: string): void {
  const events = getEvents(userId)
  const filteredEvents = events.filter((event) => event.id !== eventId)
  localStorage.setItem(`events_${userId}`, JSON.stringify(filteredEvents))

  // Also remove all RSVPs for this event
  const rsvps = getRSVPs()
  const filteredRSVPs = rsvps.filter((rsvp) => rsvp.eventId !== eventId)
  localStorage.setItem("rsvps", JSON.stringify(filteredRSVPs))
}

export function updateEvent(eventId: string, userId: string, updatedEvent: Partial<Event>): void {
  const events = getEvents(userId)
  const eventIndex = events.findIndex((event) => event.id === eventId)
  if (eventIndex !== -1) {
    events[eventIndex] = { ...events[eventIndex], ...updatedEvent }
    localStorage.setItem(`events_${userId}`, JSON.stringify(events))
  }
}

export function checkAndDeactivateExpiredEvents(userId: string): void {
  if (typeof window === "undefined") return

  const events = JSON.parse(localStorage.getItem(`events_${userId}`) || "[]")
  const now = new Date()
  let hasChanges = false

  const updatedEvents = events.map((event: Event) => {
    if (event.deadline && event.active) {
      const deadlineDate = new Date(event.deadline)
      if (now > deadlineDate) {
        hasChanges = true
        return { ...event, active: false }
      }
    }
    return event
  })

  if (hasChanges) {
    localStorage.setItem(`events_${userId}`, JSON.stringify(updatedEvents))
  }
}

// RSVP storage functions
export function saveRSVP(rsvp: RSVP): void {
  const rsvps = getRSVPs()
  const filteredRSVPs = rsvps.filter((r) => !(r.eventId === rsvp.eventId && r.guestEmail === rsvp.guestEmail))
  filteredRSVPs.push(rsvp)
  localStorage.setItem("rsvps", JSON.stringify(filteredRSVPs))
}

export function getRSVPs(): RSVP[] {
  if (typeof window === "undefined") return []
  const rsvps = localStorage.getItem("rsvps")
  return rsvps ? JSON.parse(rsvps) : []
}

export function getRSVPsForEvent(eventId: string): RSVP[] {
  const rsvps = getRSVPs()
  return rsvps.filter((rsvp) => rsvp.eventId === eventId)
}

export function removeRSVP(eventId: string, guestEmail: string): void {
  const rsvps = getRSVPs()
  const filteredRSVPs = rsvps.filter((rsvp) => !(rsvp.eventId === eventId && rsvp.guestEmail === guestEmail))
  localStorage.setItem("rsvps", JSON.stringify(filteredRSVPs))
}
