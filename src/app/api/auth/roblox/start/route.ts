/**
 * Roblox username verification — start flow.
 * POST { username } → { ok, robloxUserId, robloxUsername, displayName, code, description }
 *
 * Generates a unique verification code the user must add to their Roblox
 * profile description. The verify endpoint checks for it.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return "BF-" + s;
}

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    const clean = String(username || "").trim();
    if (!clean) {
      return NextResponse.json(
        { ok: false, error: "Roblox username is required" },
        { status: 400 },
      );
    }

    // Look up the Roblox user ID + display name via the public API
    const lookupRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [clean],
        excludeBannedUsers: true,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!lookupRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Roblox API unavailable. Try again." },
        { status: 502 },
      );
    }

    const lookupData = await lookupRes.json();
    const user = lookupData?.data?.[0];
    if (!user) {
      return NextResponse.json(
        { ok: false, error: `Roblox user "${clean}" not found` },
        { status: 404 },
      );
    }

    // Fetch their profile to get the current description
    const profileRes = await fetch(
      `https://users.roblox.com/v1/users/${user.id}`,
      { signal: AbortSignal.timeout(10000) },
    );
    let description = "";
    if (profileRes.ok) {
      const profile = await profileRes.json();
      description = profile?.description || "";
    }

    const code = generateCode();

    return NextResponse.json({
      ok: true,
      robloxUserId: String(user.id),
      robloxUsername: user.name,
      displayName: user.displayName || user.name,
      code,
      hasDescription: Boolean(description),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
