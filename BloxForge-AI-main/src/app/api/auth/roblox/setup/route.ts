import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the OAuth setup status + instructions for admins.
 * Helps admins configure Roblox OAuth2 without reading source code.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  let isAdmin = false;
  if (session?.user?.id) {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    isAdmin = user?.role === "admin";
  }

  const hasClientId = Boolean(process.env.ROBLOX_CLIENT_ID);
  const hasClientSecret = Boolean(process.env.ROBLOX_CLIENT_SECRET);
  const hasRedirectUri = Boolean(process.env.ROBLOX_REDIRECT_URI);
  const configured = hasClientId && hasClientSecret && hasRedirectUri;

  const redirectUri = process.env.ROBLOX_REDIRECT_URI || "";
  // Derive the expected callback URL from the request if not set
  const expectedCallback = redirectUri || "https://your-app.com/api/auth/roblox/oauth/callback";

  return NextResponse.json({
    configured,
    hasClientId,
    hasClientSecret,
    hasRedirectUri,
    redirectUri: isAdmin ? redirectUri : undefined,
    expectedCallback,
    adminRobloxIds: process.env.ADMIN_ROBLOX_IDS || "",
    instructions: isAdmin
      ? [
          "Go to https://create.roblox.com/credentials",
          "Create a new OAuth2 application",
          "Set the redirect URI to: " + expectedCallback,
          "Add scopes: openid, profile",
          "Copy the Client ID and Client Secret",
          "Set these env vars on your server:",
          "  ROBLOX_CLIENT_ID=<your_client_id>",
          "  ROBLOX_CLIENT_SECRET=<your_client_secret>",
          "  ROBLOX_REDIRECT_URI=" + expectedCallback,
          "Restart the server",
        ]
      : undefined,
  });
}
