import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "EventRSVP - Simple Event Management",
  description: "Simple event management and RSVP collection at eventrsvp.ca",
  generator: "v0.app",
  metadataBase: new URL("https://eventrsvp.ca"),
  openGraph: {
    title: "EventRSVP - Simple Event Management",
    description: "Simple event management and RSVP collection",
    url: "https://eventrsvp.ca",
    siteName: "EventRSVP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventRSVP - Simple Event Management",
    description: "Simple event management and RSVP collection",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
