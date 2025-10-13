"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createEvent(eventData: {
  title: string
  description: string
  date: string
  time: string
  location: string
  guest_limit: number
  deadline: string
  host_name: string
  host_email: string
}) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("User not authenticated")
    }

    // Insert the event using server-side client
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        guest_limit: eventData.guest_limit,
        deadline: eventData.deadline,
        host_name: eventData.host_name,
        host_email: eventData.host_email,
        host_user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Server action error:", error)
      throw new Error(error.message)
    }

    // Revalidate the page to show the new event
    revalidatePath("/")

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Create event error:", error)
    return { success: false, error: error.message }
  }
}
