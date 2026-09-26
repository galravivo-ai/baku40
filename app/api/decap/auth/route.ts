import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

// Step 1 of the GitHub sign-in for the admin (/admin/, Decap CMS).
// Needs GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET in Vercel.

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new NextResponse(
      "ממשק הניהול עוד לא מחובר ל‑GitHub: חסר GITHUB_OAUTH_CLIENT_ID בהגדרות Vercel.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }
  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/decap/callback/", req.nextUrl.origin).toString();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "repo,user");
  url.searchParams.set("state", state);
  const res = NextResponse.redirect(url);
  res.cookies.set("decap_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
