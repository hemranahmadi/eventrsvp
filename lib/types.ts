export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  host_name: string
  host_email: string
  host_id: string // Changed from host_user_id to match database
  created_at: string
  updated_at?: string
  guest_limit?: number
  rsvp_deadline?: string // Changed from deadline to match database
}

export interface RSVP {
  id: string
  event_id: string
  guest_name: string
  guest_email: string
  status: string // Changed from attending boolean to status string
  party_size: number
  dietary_restrictions?: string // Changed from message to match database
  created_at: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
}
