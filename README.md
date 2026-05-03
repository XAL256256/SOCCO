# NBOOG SACCO

Next.js + PostgreSQL + Prisma. Demo login after seed: **`chair`** / **`socco`** (same password for all seeded staff accounts).

---

## Local setup

```bash
npm install
cp .env.example .env
# Add your Postgres DATABASE_URL

npm run db:push
npm run db:seed
npm run dev
```

---

## Deploy on Vercel (minimal clicks)

**I can’t log into Vercel or Neon for you** — someone with access must connect storage once. After that, schema sync runs **automatically on every Vercel build** (`prisma db push` when `VERCEL=1`).

1. In [vercel.com](https://vercel.com): open your project → **Storage** → **Create Database** → choose **Postgres** (Neon).  
   Vercel attaches **`DATABASE_URL`** to the project — no copy/paste from another site.
2. Redeploy (or push to GitHub). The build creates tables.
3. **Seed once** (still required — it inserts users; we don’t run it every deploy or it would wipe data):

```bash
# From your machine, same URL Vercel uses (Vercel → Settings → Env → DATABASE_URL → reveal & copy)
DATABASE_URL="postgresql://…" npm run db:seed
```

4. Sign in: **`chair`** / **`socco`**.

Optional: set **`JWT_SECRET`** in Vercel if you want a fixed signing key instead of deriving from `DATABASE_URL`.

Disable auto-push: **`PRISMA_SKIP_PUSH=1`** in Vercel env.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (on Vercel also runs `db push`) |
| `npm run db:push` | Apply schema (local / manual) |
| `npm run db:seed` | Load demo data (**once** per database) |

---

© NBOOG SACCO · Mukono District, Uganda
