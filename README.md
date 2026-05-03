# NBOOG SACCO — Investor Preview

A premium dashboard prototype for a Ugandan Savings and Credit Cooperative,
designed at top-1% Awwwards-fidelity using:

- **Next.js 15** App Router + React 19
- **Tailwind CSS** with a custom OKLCH dark palette and gold accent
- **Framer Motion**, **Recharts**, **Sonner**, **CountUp**, **Vaul**
- **Syne / DM Sans / JetBrains Mono** typography stack

---

## Zero-config deployment

This build runs on a **fully in-memory mock dataset**. There is **no database
connection**, no Prisma, no environment secrets, no provisioning step.

Just:

```bash
git push
# import the repo in Vercel
# (no env vars needed)
```

The deployment renders identically every time — ideal for investor previews
where data should remain stable across sessions and reloads.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FXAL256256%2FSOCCO)

---

## What you'll see

| Surface             | Mock dataset |
|---------------------|--------------|
| Members             | **45** real-name members across active/inactive/suspended |
| Meetings            | 6 monthly cycles + 1 upcoming |
| Contributions       | ~250 entries, including the verified March 2026 NBOOG figures |
| Receipts            | One per contribution (~250) |
| Loans               | 9 records spanning pending, active, paid |
| Fines               | Auto-generated lateness fines |
| Reports             | Collections, Savings, Welfare, Borrowings, Repayments, Loans, Insights |

All numbers are deterministic — generated once at module load with a fixed
seed, so SSR and client renders never disagree.

---

## Local dev

```bash
npm install
npm run dev
```

That's it. There are no environment variables to set.

---

## Demo mode behaviour

Forms (Add member, Approve loan, Log contribution, etc.) post to API routes
that respond with `{ ok: true, demo: true }` — the UI surfaces a friendly
"Demo mode · not persisted" toast. The mock store is read-only by design.

The amber banner at the top of the app confirms the deployment is in
investor-preview mode and disappears after first dismissal (per session).

---

## Design system

- **Bg / Surface**: `oklch(0.18 …)` to `oklch(0.22 …)` — quiet authority
- **Gold** (`#E8A838`): primary accent for monetary totals, key actions, brand
- **Growth** (`#2DC98A`): savings, positive deltas
- **Danger** (`#E05454`): outstanding balances, defaults
- **Type**: Syne (display) · DM Sans (UI) · JetBrains Mono (numbers + IDs)
- All numbers use **tabular-nums** to avoid jitter during CountUp transitions

---

© NBOOG SACCO · Mukono District, Uganda
