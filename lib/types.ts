export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  host_name: string
  host_email: string
  host_user_id: string
  created_at: string
  active: boolean
  guest_limit?: number
  deadline?: string
}

export interface RSVP {
  id: string
  event_id: string
  guest_name: string
  guest_email: string
  attending: boolean
  party_size: number
  message?: string
  created_at: string
}

export interface User {
  id: string
  email: string
}
