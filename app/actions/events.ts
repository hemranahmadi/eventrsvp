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

    const { data, error } = await supabase.rpc("insert_event_dynamic", {
      p_title: eventData.title,
      p_description: eventData.description,
      p_date: eventData.date,
      p_time: eventData.time,
      p_location: eventData.location,
      p_guest_limit: eventData.guest_limit,
      p_deadline: eventData.deadline,
      p_host_name: eventData.host_name,
      p_host_email: eventData.host_email,
      p_host_user_id: user.id,
    })

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
