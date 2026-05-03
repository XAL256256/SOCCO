import { requireUser } from "@/lib/auth";
import { getAvailableReportYears, getBorrowingsMatrix } from "@/lib/reports";
import { ReportShell } from "@/components/reports/ReportShell";
import { MatrixTable } from "@/components/reports/MatrixTable";
import { YearPicker } from "@/components/reports/PeriodPicker";

export const dynamic = "force-dynamic";

export default async function BorrowingsReport({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const years = await getAvailableReportYears();
  const year = Number(sp.year) || years[years.length - 1];
  const report = await getBorrowingsMatrix(year);

  return (
    <ReportShell
      title={report.title}
      subtitle={`Loans disbursed in ${year}`}
      filters={<YearPicker years={years} current={year} />}
    >
      <MatrixTable
        monthLabels={report.monthLabels}
        rows={report.rows}
        columnTotals={report.columnTotals}
        grandTotal={report.grandTotal}
        exportFilename={`NBOOG-Borrowings-${year}.csv`}
      />
    </ReportShell>
  );
}
