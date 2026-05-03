import { requireUser } from "@/lib/auth";
import { getAvailableReportYears, getMonthlyCollections } from "@/lib/reports";
import { ReportShell } from "@/components/reports/ReportShell";
import { MonthPicker, YearPicker } from "@/components/reports/PeriodPicker";
import { CollectionsTable } from "./CollectionsTable";

export const dynamic = "force-dynamic";

export default async function MonthlyCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const now = new Date();
  const years = await getAvailableReportYears();
  const year = Number(sp.year) || now.getFullYear();
  const month = sp.month !== undefined ? Number(sp.month) : now.getMonth();

  const report = await getMonthlyCollections(year, month);

  return (
    <ReportShell
      title={`NBOOG Collections — ${report.month}`}
      subtitle="Member-by-member breakdown of repayments, savings, welfare, charges and fees"
      filters={
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker current={month} year={year} />
          <YearPicker years={years} current={year} />
        </div>
      }
    >
      <CollectionsTable
        rows={report.rows}
        totals={report.totals}
        exportFilename={`NBOOG-Collections-${report.month.replace(/\s/g, "-")}.csv`}
      />
    </ReportShell>
  );
}
