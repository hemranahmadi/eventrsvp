"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EventForm } from "@/components/event-form"
import { EventList } from "@/components/event-list"
import { EventDashboard } from "@/components/event-dashboard"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/hooks/use-auth"
import type { Event } from "@/lib/types"
import { Plus, Calendar, LogIn, LogOut, UserIcon, Crown, Settings, ChevronDown, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type View = "list" | "create" | "dashboard"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>("list")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    setIsMounted(true)

    const checkPremiumStatus = () => {
      const premiumStatus = localStorage.getItem("user_premium") === "true"
      setIsPremium(premiumStatus)
    }

    checkPremiumStatus()

    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("upgraded") === "true") {
      toast({
        title: "🎉 Welcome to Premium!",
        description: "You now have access to all premium analytics features.",
      })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [toast])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleEventCreated = (event: Event) => {
    setSelectedEvent(event)
    setCurrentView("dashboard")
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setCurrentView("dashboard")
  }

  const handleLogin = () => {
    setShowAuthModal(false)
  }

  const handleLogout = async () => {
    console.log("[v0] Logout clicked")
    await logout()
    setCurrentView("list")
    setIsDropdownOpen(false)
  }

  const handleEventUpdated = (updatedEvent: Event) => {
    setSelectedEvent(updatedEvent)
  }

  const handleDropdownToggle = () => {
    console.log("[v0] Dropdown toggle clicked")
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleNavigateToSettings = () => {
    console.log("[v0] Settings clicked, navigating to /settings")
    setIsDropdownOpen(false)
    router.push("/settings")
  }

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">EventRSVP</h1>
              <p className="text-muted-foreground">Simple event management and RSVP collection</p>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  <Button
                    variant={currentView === "list" ? "default" : "outline"}
                    onClick={() => setCurrentView("list")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    My Events
                  </Button>
                  <Button
                    variant={currentView === "create" ? "default" : "outline"}
                    onClick={() => setCurrentView("create")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={handleDropdownToggle}
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>{user.name}</span>
                      {isPremium && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                          <Crown className="h-3 w-3" />
                          Premium
                        </div>
                      )}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </Button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={handleNavigateToSettings}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isAuthenticated || !user ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Welcome to EventRSVP</h2>
            <p className="text-muted-foreground mb-6">Sign in to create and manage your events</p>

            <div className="mb-8">
              <Button size="lg" onClick={() => setShowAuthModal(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">See what you can track with EventRSVP</h3>
              <div className="max-w-4xl mx-auto bg-card border rounded-lg p-6 shadow-sm">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4CbeEKNuesz4bzRvVl8UD4OXzkueib.png"
                  alt="EventRSVP Dashboard Preview - Track RSVPs, guest lists, and analytics"
                  className="w-full h-auto rounded-md"
                />
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Track attendance, manage guest lists, and get detailed analytics for your events</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentView === "list" && <EventList onSelectEvent={handleSelectEvent} userId={user.id} />}

            {currentView === "create" && (
              <EventForm
                onEventCreated={handleEventCreated}
                userId={user.id}
                userName={user.name}
                userEmail={user.email}
              />
            )}

            {currentView === "dashboard" && selectedEvent && (
              <EventDashboard
                event={selectedEvent}
                onBack={() => setCurrentView("list")}
                onEventUpdated={handleEventUpdated}
                userId={user.id}
              />
            )}
          </>
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
