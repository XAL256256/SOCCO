import { requireUser } from "@/lib/auth";
import { getAvailableReportYears, getLoanApplicationsByMonth } from "@/lib/reports";
import { ReportShell } from "@/components/reports/ReportShell";
import { YearPicker } from "@/components/reports/PeriodPicker";
import { LoanApplicationsCsvButton } from "./LoanApplicationsCsvButton";
import { formatUGX } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "chip-accent",
  APPROVED: "chip-secondary",
  DISBURSED: "chip-secondary",
  ACTIVE: "chip-secondary",
  PAID: "chip-gray",
  REJECTED: "chip-danger",
  DEFAULTED: "chip-danger",
  WRITTEN_OFF: "chip-gray",
};

export default async function LoanApplicationsReport({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const years = await getAvailableReportYears();
  const year = Number(sp.year) || years[years.length - 1];
  const groups = await getLoanApplicationsByMonth(year);

  return (
    <ReportShell
      title={`NBOOG Loan Applications · ${year}`}
      subtitle="Borrowers grouped by month, with requested vs approved amounts"
      filters={
        <div className="flex items-center gap-2">
          <LoanApplicationsCsvButton groups={groups} year={year} />
          <YearPicker years={years} current={year} />
        </div>
      }
    >
      {groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No loan applications captured for {year}.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.monthLabel}>
              <h2 className="font-display text-base font-bold uppercase tracking-wider text-primary-700 mb-3">
                NBOOG Applications — {g.monthLabel}
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary-50 text-left">
                      <th className="px-3 py-2 font-display text-xs uppercase tracking-wider w-12">#</th>
                      <th className="px-3 py-2 font-display text-xs uppercase tracking-wider">Borrower</th>
                      <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                        Application
                      </th>
                      <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                        Approved
                      </th>
                      <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                        Period
                      </th>
                      <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={`${g.monthLabel}-${r.no}`} className="border-b border-gray-100">
                        <td className="px-3 py-2 font-mono text-xs text-gray-500">{r.no}</td>
                        <td className="px-3 py-2">
                          <p className="font-medium">{r.borrower}</p>
                          <p className="font-mono text-[10px] text-gray-400">{r.memberNumber}</p>
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatUGX(r.requestedAmount)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-primary-700">
                          {formatUGX(r.approvedAmount)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {r.termMonths} mo
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={STATUS_STYLES[r.status] ?? "chip-gray"}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-900 text-white">
                      <td colSpan={2} className="px-3 py-3 font-display font-bold uppercase tracking-wider">
                        Total
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold">
                        {formatUGX(g.totals.requested)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold bg-primary-700">
                        {formatUGX(g.totals.approved)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </ReportShell>
  );
}
