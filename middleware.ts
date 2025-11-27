import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const authToken = request.cookies.get("auth-token")?.value

  // Define protected and public routes
  const isProtectedRoute = pathname.startsWith("/dashboard")
  const isAuthRoute = pathname.startsWith("/auth")
  const isRootRoute = pathname === "/"

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect root to login or dashboard based on auth status
  if (isRootRoute) {
    if (authToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api).*)"],
}
