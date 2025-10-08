import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Event, RSVP } from "./types"

// Event storage functions
export async function saveEvent(event: Omit<Event, "id" | "created_at">, userId: string): Promise<Event | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...event,
      host_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving event:", error)
    return null
  }

  return data
}

export async function getEvents(userId?: string): Promise<Event[]> {
  const supabase = createBrowserClient()

  if (!userId) return []

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return data || []
}

export async function getUserEvents(userId: string): Promise<Event[]> {
  return getEvents(userId)
}

export async function getEvent(id: string): Promise<Event | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching event:", error)
    return null
  }

  return data
}

export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("events").delete().eq("id", eventId).eq("host_id", userId)

  if (error) {
    console.error("Error deleting event:", error)
  }
}

export async function updateEvent(eventId: string, userId: string, updatedEvent: Partial<Event>): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("events").update(updatedEvent).eq("id", eventId).eq("host_id", userId)

  if (error) {
    console.error("Error updating event:", error)
  }
}

// RSVP storage functions
export async function saveRSVP(rsvp: Omit<RSVP, "id" | "created_at">): Promise<RSVP | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("rsvps")
    .upsert(
      {
        event_id: rsvp.event_id,
        guest_name: rsvp.guest_name,
        guest_email: rsvp.guest_email,
        status: rsvp.status,
        party_size: rsvp.party_size,
        dietary_restrictions: rsvp.dietary_restrictions,
      },
      {
        onConflict: "event_id,guest_email",
      },
    )
    .select()
    .single()

  if (error) {
    console.error("Error saving RSVP:", error)
    return null
  }

  return data
}

export async function getRSVPs(): Promise<RSVP[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("rsvps").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching RSVPs:", error)
    return []
  }

  return data || []
}

export async function getRSVPsForEvent(eventId: string): Promise<RSVP[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching RSVPs for event:", error)
    return []
  }

  return data || []
}

export async function removeRSVP(eventId: string, guestEmail: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("rsvps").delete().eq("event_id", eventId).eq("guest_email", guestEmail)

  if (error) {
    console.error("Error removing RSVP:", error)
  }
}
