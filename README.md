# NBOOG SACCO Management System

A full-stack financial management platform for the NBOOG SACCO (Savings and Credit Cooperative Organisation), Mukono District, Uganda.

Built to AWWWARDS-level design standards with a focus on financial integrity, auditability, and security.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + custom design system |
| Animations | Framer Motion |
| Database ORM | Prisma 6 |
| Database | PostgreSQL (Neon / Supabase / Railway) |
| Auth | JWT (HS256) + HTTP-only cookies |
| Validation | Zod |
| Charts | Recharts |

---

## Features

- **Member management** — roster, profiles, status, per-member statements
- **Contribution logging** — welfare, savings, loan repayments, fines, fees
- **Receipt generation** — tamper-evident integrity hashes, version history
- **Loan module** — application, eligibility checks, chairperson approval, repayment schedule
- **Reports** — Monthly Collections, Savings Matrix, Welfare Matrix, Borrowings, Repayments, Loan Applications (all CSV + Print)
- **Member statement** — full per-member ledger with receipts, attendance, fines, loans
- **Attendance** — automatic lateness fines based on configurable grace period
- **Approvals** — chairperson dashboard for pending loans and fine waivers
- **Audit log** — every sensitive action recorded with user, IP, and metadata
- **RBAC** — Admin / Chairperson / Treasurer / Secretary / Auditor roles

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (see options below)

### 1. Clone and install

```bash
git clone https://github.com/XAL256256/SOCCO.git
cd SOCCO
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual DATABASE_URL and secrets
```

### 3. Set up the database

```bash
# Push the schema to your PostgreSQL database
npm run db:push

# Seed with initial data (44 NBOOG members + sample transactions)
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default login credentials (from seed):**
- Username: `treasurer` · Password: `treasurer123`
- Username: `chairperson` · Password: `chair123`
- Username: `admin` · Password: `admin123`

> ⚠️ Change all passwords immediately after first login.

---

## Vercel Deployment

### 1. Set up a PostgreSQL database

Recommended free options:

| Provider | Notes |
|---|---|
| **[Neon](https://neon.tech)** | Best for Vercel — provides both pooled + direct URLs |
| **[Supabase](https://supabase.com)** | Full-featured, free tier |
| **[Railway](https://railway.app)** | Simple setup, generous free tier |

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for automatic deployments.

### 3. Set environment variables in Vercel

Go to your project → **Settings** → **Environment Variables** and add:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string |
| `DIRECT_URL` | Direct (non-pooled) connection string |
| `JWT_SECRET` | 64-byte random secret (`openssl rand -base64 64`) |
| `SESSION_COOKIE_NAME` | `nboog_session` |
| `APP_NAME` | `NBOOG SACCO` |
| `APP_URL` | Your Vercel deployment URL |

### 4. Initialise the production database

Run once after first deploy — this pushes the schema to your production database:

```bash
# From your local machine with DIRECT_URL set
DATABASE_URL="<your-direct-url>" npx prisma db push

# Optionally seed initial data
DATABASE_URL="<your-direct-url>" npm run db:seed
```

---

## Database Migrations

This project uses `prisma db push` for schema management. If you make schema changes:

```bash
# Development
npm run db:push

# Check schema
npx prisma studio
```

---

## Security Notes

- JWT tokens stored in HTTP-only cookies
- bcryptjs for password hashing
- In-memory rate limiting + account lockout after failed logins
- All sensitive actions logged to `AuditLog` table
- Receipt integrity verified via SHA-256 hash
- RBAC enforced on all API routes
- Comprehensive CSP headers via `next.config.ts`

---

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated routes
│   │   ├── dashboard/
│   │   ├── members/
│   │   ├── contributions/
│   │   ├── loans/
│   │   ├── reports/
│   │   └── approvals/
│   ├── api/            # REST API routes
│   └── (auth)/         # Login page
├── components/
│   ├── layout/         # Sidebar, Header
│   ├── ui/             # Design system components
│   ├── members/
│   └── reports/
└── lib/
    ├── auth.ts         # JWT + session management
    ├── reports.ts      # Report computation logic
    ├── loans.ts        # Loan eligibility + scheduling
    ├── crypto.ts       # Receipt integrity hashing
    └── csv.ts          # Client-side CSV export
prisma/
├── schema.prisma       # Database schema
└── seed.ts             # Initial data seed
```

---

## Licence

Private — NBOOG SACCO, Mukono District, Uganda. All rights reserved.
