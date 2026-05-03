/**
 * On Vercel (VERCEL=1), sync the schema during build so you don't run
 * `db push` manually. Requires DATABASE_URL on the project.
 *
 * Locally: skipped (use `npm run db:push`). Override with PRISMA_SKIP_PUSH=1.
 */
import { spawnSync } from "node:child_process";

if (process.env.PRISMA_SKIP_PUSH === "1") {
  console.log("[build] PRISMA_SKIP_PUSH=1 — skipping prisma db push");
  process.exit(0);
}

if (process.env.VERCEL !== "1") {
  console.log("[build] Local build — skipping prisma db push (use: npm run db:push)");
  process.exit(0);
}

if (!process.env.DATABASE_URL?.trim()) {
  console.error("[build] Vercel build missing DATABASE_URL — add Postgres in project settings");
  process.exit(1);
}

const r = spawnSync(
  "npx",
  ["prisma", "db", "push", "--skip-generate"],
  { stdio: "inherit", shell: true }
);
process.exit(r.status ?? 1);
