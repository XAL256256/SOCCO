import { requireUser } from "@/lib/auth";
import { getAvailableReportYears, getSavingsMatrix } from "@/lib/reports";
import { ReportShell } from "@/components/reports/ReportShell";
import { MatrixTable } from "@/components/reports/MatrixTable";
import { YearPicker } from "@/components/reports/PeriodPicker";

export const dynamic = "force-dynamic";

export default async function SavingsReport({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const years = await getAvailableReportYears();
  const year = Number(sp.year) || years[years.length - 1];
  const report = await getSavingsMatrix(year);

  return (
    <ReportShell
      title={report.title}
      subtitle={`Per-member savings deposits for ${year}`}
      filters={<YearPicker years={years} current={year} />}
    >
      <MatrixTable
        monthLabels={report.monthLabels}
        rows={report.rows}
        columnTotals={report.columnTotals}
        grandTotal={report.grandTotal}
        exportFilename={`NBOOG-Savings-${year}.csv`}
      />
    </ReportShell>
  );
}
