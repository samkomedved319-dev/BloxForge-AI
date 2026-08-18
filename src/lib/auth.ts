import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/** Comma-separated list of admin emails (env-configurable). */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.toLowerCase().trim())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(e);
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/",
  },
  providers: [
    // Roblox verification — the primary auth for all users
    CredentialsProvider({
      id: "roblox",
      name: "Roblox",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token;
        if (!token) return null;
        try {
          const decoded = JSON.parse(
            Buffer.from(token, "base64").toString("utf-8"),
          ) as { userId?: string; robloxUserId?: string; ts?: number };
          if (!decoded.userId) return null;
          if (!decoded.ts || Date.now() - decoded.ts > 10 * 60 * 1000) return null;

          const user = await db.user.findUnique({
            where: { id: decoded.userId },
          });
          if (!user) return null;
          if (
            user.robloxUserId &&
            decoded.robloxUserId &&
            user.robloxUserId !== decoded.robloxUserId
          ) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            plan: user.plan,
            role: user.role,
            approved: user.approved,
          } as any;
        } catch {
          return null;
        }
      },
    }),
    // Admin-only password provider — regular users must use Roblox
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || user.role !== "admin") return null;
        if (!user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          plan: user.plan,
          role: user.role,
          approved: true,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in — set from the authorize result
        token.id = (user as any).id;
        token.plan = (user as any).plan ?? "free";
        token.role = (user as any).role ?? "user";
        token.approved = (user as any).approved ?? false;
      }
      // Refresh from DB on every JWT render so approval/role/plan changes
      // by an admin take effect without requiring the user to re-sign-in.
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { plan: true, role: true, approved: true },
          });
          if (dbUser) {
            token.plan = dbUser.plan;
            token.role = dbUser.role;
            token.approved = dbUser.approved;
          }
        } catch {
          // DB might not be available (e.g. Vercel serverless cold start)
          // Keep the cached values from the initial sign-in
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan ?? "free";
        (session.user as any).role = token.role ?? "user";
        (session.user as any).approved = token.approved ?? false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "bloxforge-dev-secret-change-me",
};
