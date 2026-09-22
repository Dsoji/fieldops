// Shareable personalised demo link, e.g.
//   /demo?industry=telecom&client=Acme%20Towers&color=%230a7cff&logo=https://...&manager=Jane%20Doe
// Saves the settings in a cookie and opens the dashboard.

import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, sanitizeConfig } from "@/lib/demo/config";

export function GET(request: NextRequest) {
  const cfg = sanitizeConfig(Object.fromEntries(request.nextUrl.searchParams));
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(DEMO_COOKIE, JSON.stringify(cfg), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
