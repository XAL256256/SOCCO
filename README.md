# NBOOG SACCO

Next.js + PostgreSQL + Prisma. Demo login after seed: **`chair`** / **`socco`** (same password for `admin`, `treasurer`, `secretary`, `auditor`).

---

## Local setup

```bash
npm install
cp .env.example .env
# Put your Neon DATABASE_URL in .env

npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy on Vercel

1. Create a free Postgres DB at [neon.tech](https://neon.tech) and copy the connection string.
2. Import this repo in [vercel.com](https://vercel.com).
3. Add **one** env var: `DATABASE_URL` = that connection string.  
   (`JWT_SECRET` is optional — if you skip it, the app derives a stable secret from `DATABASE_URL`.)
4. After the first deploy succeeds, run once from your laptop (same `DATABASE_URL` in the command):

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run db:seed
```

5. Sign in with **`chair`** / **`socco`**.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Apply schema to DB |
| `npm run db:seed` | Load demo data |

---

© NBOOG SACCO · Mukono District, Uganda
