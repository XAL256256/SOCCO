# NBOOG SACCO

Next.js + PostgreSQL + Prisma. **No login screen** — the app assumes a single operator and attaches actions to the seeded staff user `chair` (or the first user in the database).

Seed once: `npm run db:push` then `npm run db:seed`.

---

## Local dev

```bash
npm install
cp .env.example .env
# Set DATABASE_URL (or POSTGRES_PRISMA_URL on Vercel)

npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — goes straight to the dashboard.

---

## Vercel

Link Postgres (Storage → Postgres). Build syncs schema when DB URLs are present (see `scripts/prisma-push-if-enabled.mjs`). Seed once from your machine with the same URL as production.

**Security:** There is **no authentication**. Anyone who can open the URL can use the app. Use only on trusted networks / VPN, or put Vercel behind password protection / IP allowlisting if needed.

---

© NBOOG SACCO · Mukono District, Uganda
