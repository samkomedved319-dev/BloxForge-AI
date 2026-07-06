/**
 * Roblox username verification — verify flow.
 * POST { robloxUserId, robloxUsername, code } → checks Roblox description for code.
 * If verified: creates/finds a BloxForge user linked to the Roblox user ID and
 * returns credentials the client can pass to NextAuth signIn.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { robloxUserId, robloxUsername, code } = await req.json();

    if (!robloxUserId || !code) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 },
      );
    }

    // Fetch the Roblox profile to verify the code is in the description
    const profileRes = await fetch(
      `https://users.roblox.com/v1/users/${robloxUserId}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!profileRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Could not reach Roblox. Try again." },
        { status: 502 },
      );
    }

    const profile = await profileRes.json();
    const description = String(profile?.description || "");

    if (!description.includes(code)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Verification code not found in your Roblox profile description. Make sure you saved it and try again.",
        },
        { status: 400 },
      );
    }

    // Verified! Create or find the BloxForge user.
    const email = `roblox:${robloxUserId}@bloxforge.local`;
    const username = robloxUsername || profile?.name || `RobloxUser${robloxUserId}`;

    // Check for existing admin with this Roblox ID (for auto-promoted admins)
    const ADMIN_ROBLOX_IDS = (process.env.ADMIN_ROBLOX_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const isAdminRoblox = ADMIN_ROBLOX_IDS.includes(String(robloxUserId));

    let user = await db.user.findUnique({
      where: { robloxUserId: String(robloxUserId) },
    });

    if (!user) {
      // Create new account. Beta: not approved unless admin.
      user = await db.user.create({
        data: {
          email,
          name: username,
          robloxUserId: String(robloxUserId),
          robloxUsername: username,
          passwordHash: "", // no password — Roblox-auth only
          approved: isAdminRoblox, // admins auto-approved
          role: isAdminRoblox ? "admin" : "user",
          plan: isAdminRoblox ? "studio" : "free",
        },
      });
    } else {
      // Update cached username
      user = await db.user.update({
        where: { id: user.id },
        data: { robloxUsername: username, name: username },
      });
    }

    // Return a token the client can use to sign in via a custom credentials flow
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        robloxUserId: String(robloxUserId),
        ts: Date.now(),
      }),
    ).toString("base64");

    return NextResponse.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
