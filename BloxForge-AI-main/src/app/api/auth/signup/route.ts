import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    const normalizedEmail = (email ?? "").toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 },
      );
    }

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Auto-promote configured admin emails
    const isAdmin = isAdminEmail(normalizedEmail);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        passwordHash,
        plan: isAdmin ? "studio" : "free",
        role: isAdmin ? "admin" : "user",
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[signup] error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
