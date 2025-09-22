const testEvent = {
  id: "preview-event-123",
  title: "Annual Company Retreat",
  description: "Join us for our annual company retreat with team building activities, presentations, and networking.",
  date: "2024-06-15",
  time: "09:00",
  location: "Mountain View Conference Center",
  guestLimit: 100,
  deadline: "2024-06-10T23:59",
  active: true,
  createdAt: new Date().toISOString(),
}

const testRSVPs = [
  {
    id: "rsvp-1",
    eventId: "preview-event-123",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    attending: true,
    partySize: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rsvp-2",
    eventId: "preview-event-123",
    name: "Mike Chen",
    email: "mike@company.com",
    attending: true,
    partySize: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rsvp-3",
    eventId: "preview-event-123",
    name: "Emily Davis",
    email: "emily@company.com",
    attending: false,
    partySize: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rsvp-4",
    eventId: "preview-event-123",
    name: "John Smith",
    email: "john@company.com",
    attending: true,
    partySize: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rsvp-5",
    eventId: "preview-event-123",
    name: "Lisa Wang",
    email: "lisa@company.com",
    attending: false,
    partySize: 2,
    createdAt: new Date().toISOString(),
  },
]

// Store test data in localStorage
const testUser = {
  id: "preview-user",
  name: "Demo User",
  email: "demo@eventRSVP.com",
}

localStorage.setItem("current_user", JSON.stringify(testUser))
localStorage.setItem(`events_${testUser.id}`, JSON.stringify([testEvent]))
localStorage.setItem(`rsvps_${testEvent.id}`, JSON.stringify(testRSVPs))

console.log("Test event and RSVPs created successfully!")
console.log("Event:", testEvent)
console.log("RSVPs:", testRSVPs)
