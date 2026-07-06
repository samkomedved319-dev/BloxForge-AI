import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROBLOX_OAUTH_BASE = "https://apis.roblox.com/oauth";
const STATE_COOKIE = "bloxforge_oauth_state";

/**
 * Start the Roblox OAuth2 authorization-code flow.
 * Redirects the user to Roblox's authorize endpoint. After the user logs in
 * and authorizes, Roblox redirects back to /api/auth/roblox/oauth/callback.
 *
 * Requires env vars:
 *   ROBLOX_CLIENT_ID
 *   ROBLOX_CLIENT_SECRET
 *   ROBLOX_REDIRECT_URI  (must match what's registered in Creator Hub)
 */
export async function GET() {
  const clientId = process.env.ROBLOX_CLIENT_ID;
  const redirectUri = process.env.ROBLOX_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Roblox OAuth is not configured. Set ROBLOX_CLIENT_ID and ROBLOX_REDIRECT_URI env vars, and register an OAuth app at https://create.roblox.com/credentials.",
      },
      { status: 500 },
    );
  }

  // Generate a random state to prevent CSRF
  const state =
    Math.random().toString(36).slice(2) + Date.now().toString(36);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile",
    state,
  });

  const authorizeUrl = `${ROBLOX_OAUTH_BASE}/v1/authorize?${params}`;

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60, // 10 min
    path: "/",
  });
  return res;
}
