/**
 * Vercel "Storage → Postgres" injects POSTGRES_PRISMA_URL / POSTGRES_URL.
 * Prisma and JWT derivation expect DATABASE_URL — normalize once at startup.
 */
const alt =
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();

if (!process.env.DATABASE_URL?.trim() && alt) {
  process.env.DATABASE_URL = alt;
}
