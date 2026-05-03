import { requireUser } from "@/lib/auth";
import {
  getAvailableReportYears,
  getWelfareArrears,
  getWelfareMatrix,
} from "@/lib/reports";
import { listSettings } from "@/lib/data/queries";
import { TODAY } from "@/lib/data/source";
import { ReportShell } from "@/components/reports/ReportShell";
import { MatrixTable } from "@/components/reports/MatrixTable";
import { YearPicker } from "@/components/reports/PeriodPicker";
import { formatUGX } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WelfareReport({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const years = await getAvailableReportYears();
  const year = Number(sp.year) || years[years.length - 1];

  const matrix = await getWelfareMatrix(year);
  const expectedSetting = listSettings().find(
    (s) => s.key === "sacco.welfarePerMeeting"
  );
  const monthlyExpected = Number(expectedSetting?.value ?? 30000);
  const arrears = await getWelfareArrears(TODAY, monthlyExpected);

  return (
    <ReportShell
      title={matrix.title}
      subtitle={`Welfare contributions ${year} · expected ${formatUGX(
        monthlyExpected
      )} per member per month`}
      filters={<YearPicker years={years} current={year} />}
    >
      <MatrixTable
        monthLabels={matrix.monthLabels}
        rows={matrix.rows}
        columnTotals={matrix.columnTotals}
        grandTotal={matrix.grandTotal}
        exportFilename={`NBOOG-Welfare-${year}.csv`}
      />

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold uppercase tracking-wider">
          Welfare Arrears (as of today)
        </h2>
        <p className="text-sm text-gray-500">
          Computed as months active × {formatUGX(monthlyExpected)} − amount
          paid.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="bg-secondary-50 text-left">
                <th className="px-3 py-2 font-display text-xs uppercase tracking-wider w-12">#</th>
                <th className="px-3 py-2 font-display text-xs uppercase tracking-wider">Member</th>
                <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                  Months active
                </th>
                <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                  Expected
                </th>
                <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                  Paid
                </th>
                <th className="px-3 py-2 font-display text-xs uppercase tracking-wider text-right">
                  Arrears
                </th>
              </tr>
            </thead>
            <tbody>
              {arrears.rows.map((r) => (
                <tr key={r.memberId} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">{r.no}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{r.memberName}</p>
                    <p className="font-mono text-[10px] text-gray-400">{r.memberNumber}</p>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{r.monthsActive}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatUGX(r.expected)}</td>
                  <td className="px-3 py-2 text-right font-mono text-secondary-700">
                    {formatUGX(r.paid)}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-bold ${r.arrears > 0 ? "text-red-600" : "text-gray-400"}`}>
                    {r.arrears > 0 ? formatUGX(r.arrears) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-white">
                <td colSpan={3} className="px-3 py-3 font-display font-bold uppercase tracking-wider">
                  TOTAL
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold">
                  {formatUGX(arrears.totals.expected)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold">
                  {formatUGX(arrears.totals.paid)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold bg-primary-700">
                  {formatUGX(arrears.totals.arrears)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ReportShell>
  );
}
