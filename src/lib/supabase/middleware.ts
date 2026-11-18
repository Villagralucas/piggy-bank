import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, DEMO_MODE } from "@/lib/demo-mode";

const PUBLIC_PATHS = ["/login", "/signup", "/auth/", "/demo"];

export async function updateSession(request: NextRequest) {
  if (DEMO_MODE) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  // A signed-in user never stays in demo mode.
  if (user && request.cookies.get(DEMO_COOKIE)) {
    const response = NextResponse.redirect(request.nextUrl.clone());
    response.cookies.delete(DEMO_COOKIE);
    return response;
  }

  const isDemoViewer =
    request.cookies.get(DEMO_COOKIE)?.value === "1" &&
    request.nextUrl.pathname.startsWith("/dashboard");

  if (!user && !isPublicPath && !isDemoViewer) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
