import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROBLOX_OAUTH_BASE = "https://apis.roblox.com/oauth";
const STATE_COOKIE = "bloxforge_oauth_state";

function getAdminRobloxIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_ROBLOX_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export async function GET(req: NextRequest) {
  const clientId = process.env.ROBLOX_CLIENT_ID;
  const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
  const redirectUri = process.env.ROBLOX_REDIRECT_URI;
  const appOrigin = process.env.NEXTAUTH_URL || `https://${req.nextUrl.host}`;

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

  const cookieState = req.cookies.get(STATE_COOKIE)?.value;
  if (!state || state !== cookieState) {
    return NextResponse.redirect(`${appOrigin}/#auth-error=invalid_state`);
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${appOrigin}/#auth-error=not_configured`);
  }

  // Wrap everything in a try/catch so Vercel never returns a raw 500
  try {
    // 1. Exchange the authorization code for an access token
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

    // 2. Fetch the user's Roblox identity via OpenID Connect userinfo
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

    // 3. Create or find the BloxForge user in the DB
    const adminIds = getAdminRobloxIds();
    const isAdmin = adminIds.has(robloxUserId) || adminIds.has(robloxUsername.toLowerCase());

    let userId: string;
    try {
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
            approved: isAdmin,
            role: isAdmin ? "admin" : "user",
            plan: isAdmin ? "studio" : "free",
          },
        });
      } else {
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
      userId = user.id;
    } catch (dbErr) {
      console.error("[roblox oauth] DB error:", dbErr);
      return NextResponse.redirect(`${appOrigin}/#auth-error=database_error`);
    }

    // 4. Create a sign-in token + redirect
    const token = Buffer.from(
      JSON.stringify({
        userId,
        robloxUserId,
        ts: Date.now(),
      }),
    ).toString("base64");

    const res = NextResponse.redirect(
      `${appOrigin}/#roblox-token=${token}`,
    );
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err) {
    console.error("[roblox oauth] unexpected error:", err);
    return NextResponse.redirect(`${appOrigin}/#auth-error=unexpected`);
  }
}
