/**
 * Vercel build: sync Prisma schema when any Postgres URL is present.
 *
 * Vercel Storage often sets POSTGRES_PRISMA_URL or POSTGRES_URL — not DATABASE_URL.
 * PRISMA_PUSH_ON_BUILD=0 skips entirely.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");

if (process.env.VERCEL !== "1") {
  console.log("[build] Local build — skipping prisma db push (use: npm run db:push)");
  process.exit(0);
}

if (process.env.PRISMA_PUSH_ON_BUILD === "0") {
  console.log("[build] PRISMA_PUSH_ON_BUILD=0 — skipping prisma db push");
  process.exit(0);
}

const raw =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();

if (!raw) {
  console.warn(
    "[build] No DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL — skipping prisma db push."
  );
  console.warn(
    "[build] After linking Vercel Postgres, enable those vars for “Build” or run: npm run db:push"
  );
  process.exit(0);
}

if (!existsSync(prismaCli)) {
  console.error("[build] prisma CLI missing at", prismaCli);
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: raw };

console.log("[build] prisma db push…");

const r = spawnSync(process.execPath, [prismaCli, "db", "push", "--skip-generate"], {
  stdio: "inherit",
  env,
  cwd: root,
});

if (r.status !== 0) {
  console.error("[build] prisma db push failed — check connection string & network.");
}
process.exit(r.status ?? 1);
