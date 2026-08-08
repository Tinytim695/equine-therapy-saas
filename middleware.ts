import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Public routes
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthCallback = pathname.startsWith("/auth/callback");

  // Unauthenticated users trying to access protected routes
  if (!user && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated users on auth pages → redirect by role
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";
    const url = request.nextUrl.clone();
    url.pathname = role === "therapist" ? "/dashboard/pro" : "/dashboard/client";
    return NextResponse.redirect(url);
  }

  // Role-based dashboard protection
  if (user && isDashboard) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";

    if (pathname.startsWith("/dashboard/pro") && role !== "therapist") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/client";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/dashboard/client") && role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/pro";
      return NextResponse.redirect(url);
    }
  }

  // Allow auth callback and everything else through
  if (isAuthCallback) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
