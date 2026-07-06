/**
 * Seed the admin account.
 * Run with: bun run scripts/seed-admin.ts
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD env vars (with defaults below).
 * Idempotent: if the account exists, its role is promoted to admin and the
 * password is updated to match.
 */
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "samkomedved319@gmail.com")
  .toLowerCase()
  .trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Brabus102";
const ADMIN_NAME = process.env.ADMIN_NAME || "BloxForge Admin";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: { role: "admin", plan: "studio", passwordHash, name: ADMIN_NAME },
    });
    console.log(`[seed] Promoted existing account to admin: ${ADMIN_EMAIL}`);
  } else {
    await db.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        passwordHash,
        role: "admin",
        plan: "studio",
      },
    });
    console.log(`[seed] Created admin account: ${ADMIN_EMAIL}`);
  }
}

main()
  .catch((e) => {
    console.error("[seed] failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
