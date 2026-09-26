import { NextResponse, type NextRequest } from "next/server";

// Step 2 of the GitHub sign-in: exchange the code for a token and hand it
// to the Decap CMS window (its standard postMessage protocol). GitHub itself
// decides who may save: only accounts with push access to the repository.

export const dynamic = "force-dynamic";

function page(status: "success" | "error", payload: object) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const html = `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><title>התחברות</title><body>
<p>${status === "success" ? "מתחבר…" : "ההתחברות נכשלה. אפשר לסגור את החלון ולנסות שוב."}</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  function receive(e) {
    window.opener.postMessage(message, e.origin);
    window.removeEventListener("message", receive, false);
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`;
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expected = req.cookies.get("decap_oauth_state")?.value;
  if (!code || !state || state !== expected) return page("error", { message: "state mismatch" });

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) return page("error", { message: data.error_description ?? "no token" });
  return page("success", { token: data.access_token, provider: "github" });
}
