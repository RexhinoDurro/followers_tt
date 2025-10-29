import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // In a real app, you'd check for a valid session token here
    // For now, we'll let the client-side auth context handle it
    return NextResponse.next()
  }

  // Check if accessing auth page
  if (pathname === "/auth") {
    // If user is already authenticated (has token), redirect to dashboard
    // This would be checked via cookies in a real implementation
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
}
