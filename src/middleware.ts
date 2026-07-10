import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

// `/jarvis` is the command center. It runs on seed data today, so it's
// public for now — protect it once it's wired to your real accounts.
const PUBLIC_PATHS = ["/login", "/api/auth/callback", "/jarvis"]
const CRON_PATHS = ["/api/cron/", "/api/webhooks/"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The root now lands on the Jarvis command center.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/jarvis", request.url))
  }

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow cron/webhook endpoints (they validate their own secrets)
  if (CRON_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Create a response to potentially refresh the session cookie
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Refresh session — this updates the session cookie if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Unauthenticated — redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Read role from app_metadata (set at user creation, in JWT — zero DB queries)
  const role = (user.app_metadata?.role as string) ?? "client"

  // Redirect admin visiting / or /dashboard to /admin/dashboard
  if (role === "admin" && (pathname === "/" || pathname.startsWith("/dashboard"))) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  // Redirect client visiting /admin/* to their dashboard
  if (role === "client" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect / to role-appropriate dashboard
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
