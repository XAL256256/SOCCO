# NBOOG SACCO

A web application for managing membership, attendance, contributions, loans
and reporting for the **NBOOG SACCO** — a savings and credit cooperative
based in Mukono District, Uganda.

## Stack

- Next.js 15 (App Router) and React 19
- TypeScript
- Tailwind CSS
- Recharts, Framer Motion, Sonner, CountUp

## Modules

- **Members** — register, search and view individual statements
- **Meetings** — schedule monthly meetings and capture attendance
- **Contributions** — log welfare, savings, loan repayments and fees per meeting
- **Receipts** — auto-numbered receipts with integrity hashes
- **Loans** — applications, approvals, disbursement and repayment schedules
- **Fines** — late-attendance fines, with waivers
- **Reports** — collections, savings, welfare, borrowings, repayments, loans
- **Member statement** — printable per-member yearly statement

## Local development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Deployment

Push the repository and import it into Vercel. No environment variables are
required for the bundled cooperative configuration.

## Repository layout

```
src/
  app/                 Next.js routes (App Router)
    (app)/             Authenticated app shell + pages
    api/               JSON endpoints
  components/          UI components (layout, charts, tables, modals)
  lib/
    auth.ts            Role-based session helpers
    dashboard.ts       Aggregated dashboard metrics
    loans.ts           Loan eligibility + amortisation
    reports.ts         Report aggregations
    data/              Cooperative roster, contributions, loans
```

## License

Proprietary — NBOOG SACCO, Mukono District, Uganda.
