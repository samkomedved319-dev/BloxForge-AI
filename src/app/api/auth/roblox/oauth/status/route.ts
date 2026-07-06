import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tells the client whether Roblox OAuth2 is configured (so it can show the button). */
export async function GET() {
  const configured = Boolean(
    process.env.ROBLOX_CLIENT_ID && process.env.ROBLOX_REDIRECT_URI,
  );
  return NextResponse.json({ configured });
}
