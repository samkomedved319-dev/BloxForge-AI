import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROBLOX_OAUTH_BASE = "https://apis.roblox.com/oauth";
const STATE_COOKIE = "bloxforge_oauth_state";

/** Admin Roblox usernames/IDs that should be auto-promoted + auto-approved. */
function getAdminRobloxIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_ROBLOX_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Roblox OAuth2 callback. Roblox redirects here with ?code=...&state=...
 * We exchange the code for an access token, fetch userinfo, then create/find
 * the BloxForge user and sign them in via a short-lived token cookie that
 * the client-side NextAuth provider reads.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.ROBLOX_CLIENT_ID;
  const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
  const redirectUri = process.env.ROBLOX_REDIRECT_URI;
  const appOrigin = process.env.NEXTAUTH_URL || req.nextUrl.origin;

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${appOrigin}/#auth-error=${encodeURIComponent(error)}`,
    );
  }
  if (!code) {
    return NextResponse.redirect(`${appOrigin}/#auth-error=no_code`);
  }

  // Verify state
  const cookieState = req.cookies.get(STATE_COOKIE)?.value;
  if (!state || state !== cookieState) {
    return NextResponse.redirect(`${appOrigin}/#auth-error=invalid_state`);
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${appOrigin}/#auth-error=not_configured`);
  }

  // Exchange the authorization code for an access token
  let accessToken: string;
  try {
    const tokenRes = await fetch(`${ROBLOX_OAUTH_BASE}/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!tokenRes.ok) {
      const t = await tokenRes.text().catch(() => "");
      console.error("[roblox oauth] token exchange failed:", tokenRes.status, t);
      return NextResponse.redirect(
        `${appOrigin}/#auth-error=token_failed`,
      );
    }

    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    if (!accessToken) {
      return NextResponse.redirect(`${appOrigin}/#auth-error=no_access_token`);
    }
  } catch (err) {
    console.error("[roblox oauth] token exchange error:", err);
    return NextResponse.redirect(`${appOrigin}/#auth-error=token_exception`);
  }

  // Fetch the user's Roblox identity via OpenID Connect userinfo
  let robloxUserId: string;
  let robloxUsername: string;
  let displayName: string;
  try {
    const uiRes = await fetch(`${ROBLOX_OAUTH_BASE}/v1/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!uiRes.ok) {
      return NextResponse.redirect(`${appOrigin}/#auth-error=userinfo_failed`);
    }

    const ui = await uiRes.json();
    robloxUserId = String(ui.sub || ui.user_id || ui.id || "");
    robloxUsername = ui.preferred_username || ui.name || ui.username || "";
    displayName = ui.name || ui.nickname || robloxUsername;

    if (!robloxUserId) {
      return NextResponse.redirect(`${appOrigin}/#auth-error=no_user_id`);
    }
  } catch (err) {
    console.error("[roblox oauth] userinfo error:", err);
    return NextResponse.redirect(`${appOrigin}/#auth-error=userinfo_exception`);
  }

  // Create or find the BloxForge user
  const adminIds = getAdminRobloxIds();
  const isAdmin = adminIds.has(robloxUserId) || adminIds.has(robloxUsername.toLowerCase());

  let user = await db.user.findUnique({
    where: { robloxUserId },
  });

  if (!user) {
    const email = `roblox:${robloxUserId}@bloxforge.local`;
    user = await db.user.create({
      data: {
        email,
        name: robloxUsername || displayName,
        robloxUserId,
        robloxUsername: robloxUsername || displayName,
        passwordHash: "",
        approved: isAdmin, // admins auto-approved; others wait for beta approval
        role: isAdmin ? "admin" : "user",
        plan: isAdmin ? "studio" : "free",
      },
    });
  } else {
    // Update cached username + promote to admin if configured
    const data: any = {
      robloxUsername: robloxUsername || displayName,
      name: robloxUsername || displayName,
    };
    if (isAdmin && user.role !== "admin") {
      data.role = "admin";
      data.plan = "studio";
      data.approved = true;
    }
    user = await db.user.update({ where: { id: user.id }, data });
  }

  // Create a short-lived sign-in token the client NextAuth provider will consume
  const token = Buffer.from(
    JSON.stringify({
      userId: user.id,
      robloxUserId,
      ts: Date.now(),
    }),
  ).toString("base64");

  // Redirect to the app with the token in the hash (client reads it + calls signIn)
  const res = NextResponse.redirect(
    `${appOrigin}/#roblox-token=${token}`,
  );
  res.cookies.delete(STATE_COOKIE);
  return res;
}
