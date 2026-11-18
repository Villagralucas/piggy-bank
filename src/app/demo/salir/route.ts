import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo-mode";

export function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get("to") === "signup" ? "/signup" : "/";
  const response = NextResponse.redirect(new URL(to, request.url));
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
