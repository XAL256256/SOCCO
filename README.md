# NBOOG SACCO

Next.js + Postgres + Prisma. **No login** — use **View as** in the navbar to demo Chairperson, Treasurer, etc.

---

## Fastest path on Vercel (≈2 clicks we cannot automate for you)

Nobody can create a database **inside your Vercel account** from GitHub alone — Postgres always needs **one** attach step on Vercel’s side.

After that, **this repo does the rest**: build runs `prisma db push` and, if the DB is empty, **auto-creates demo staff + settings** — **no `npm run db:seed`** on your laptop.

### Steps

1. **Import this repo** in [vercel.com New Project](https://vercel.com/new).
2. Before or after the first deploy: open the project → **Storage** → **Create Database** → **Postgres** → attach it to this project.  
   Vercel injects `POSTGRES_PRISMA_URL` / `DATABASE_URL` for **Production** (enable **Build** + **Preview** if prompted).
3. **Redeploy** if the first build ran without Postgres (build skips DB until URLs exist).

That's it for a **working empty demo**. Navbar **View as** works with the seeded roles.

### Optional: full Excel-like demo data

From your machine (same DB URL Vercel shows):

```bash
npm run db:seed
```

That loads the 44-member roster + meetings + contributions (it **resets** demo data — use only when you want the big dataset).

Disable auto-bootstrap on Vercel: set env **`AUTO_BOOTSTRAP=0`**.

---

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FXAL256256%2FSOCCO)

*(After import, add Postgres Storage as above — the button cannot do that for you.)*

---

## Local dev

```bash
npm install
cp .env.example .env
# DATABASE_URL=...

npm run db:push
npm run db:seed   # optional full dataset
npm run dev
```

---

**Security:** There is no authentication. Restrict who can open the deployment URL.

© NBOOG SACCO · Mukono District, Uganda
