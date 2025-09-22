export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  hostName: string
  hostEmail: string
  createdAt: string
  active: boolean // Added active status field for event management
  guestLimit?: number // Added optional guest limit field
  deadline?: string // Optional deadline for RSVPs (ISO date string)
}

export interface RSVP {
  id: string
  eventId: string
  guestName: string
  guestEmail: string
  attending: boolean
  partySize: number
  message?: string
  createdAt: string
}
