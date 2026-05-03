import { requireUser } from "@/lib/auth";
import { getAvailableReportYears, getRepaymentsMatrix } from "@/lib/reports";
import { ReportShell } from "@/components/reports/ReportShell";
import { MatrixTable } from "@/components/reports/MatrixTable";
import { YearPicker } from "@/components/reports/PeriodPicker";

export const dynamic = "force-dynamic";

export default async function RepaymentsReport({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const years = await getAvailableReportYears();
  const year = Number(sp.year) || years[years.length - 1];
  const report = await getRepaymentsMatrix(year);

  return (
    <ReportShell
      title={report.title}
      subtitle={`Loan repayments captured in ${year}`}
      filters={<YearPicker years={years} current={year} />}
    >
      <MatrixTable
        monthLabels={report.monthLabels}
        rows={report.rows}
        columnTotals={report.columnTotals}
        grandTotal={report.grandTotal}
        exportFilename={`NBOOG-Repayments-${year}.csv`}
      />
    </ReportShell>
  );
}
