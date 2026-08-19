import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PERSONALITIES } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List all available AI models/personalities with their config. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Any authenticated user can see the model list (for the picker).
  // Admins see the full config.
  const isAdmin = (session.user as any).role === "admin";

  const models = PERSONALITIES.map((p) => ({
    id: p.id,
    label: p.label,
    model: p.model,
    vendor: p.vendor,
    tier: p.tier,
    tagline: p.tagline,
    badge: p.badge || null,
    speed: p.speed,
    strength: p.strength,
    beta: p.beta || false,
    studioOnly: p.studioOnly || false,
    active: true, // all models are active by default
  }));

  return NextResponse.json({
    models,
    isAdmin,
  });
}
