import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Auth0 will handle authentication through its API routes
  // Protected routes can be handled at the component level instead
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Optional: protect specific routes if needed
    "/settings/:path*",
  ],
}
