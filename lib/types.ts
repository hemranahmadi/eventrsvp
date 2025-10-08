export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  host_name: string
  host_email: string
  host_user_id: string // Matches database column name
  active: boolean // Matches database column
  created_at: string
  updated_at?: string
  guest_limit?: number
  deadline?: string // Matches database column name
}

export interface RSVP {
  id: string
  event_id: string
  guest_name: string
  guest_email: string
  attending: boolean // Matches database column (boolean, not status string)
  party_size: number
  message?: string // Matches database column name
  created_at: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
}
