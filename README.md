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

**Connect Postgres once** in Vercel → **Storage** → **Create** → **Postgres**.  
Vercel usually injects **`POSTGRES_PRISMA_URL`** (not `DATABASE_URL`). This app maps that automatically for Prisma + JWT.

On each Vercel build we run **`prisma db push`** when any of these exist: `DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`.  
If none are visible at **build** time, the build still succeeds and we skip push — then either enable those variables for **Build** in Vercel, or run `npm run db:push` locally once.

Set **`PRISMA_PUSH_ON_BUILD=0`** to never run push during build.
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
