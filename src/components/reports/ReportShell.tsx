"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  onExportCsv?: () => void;
  children: React.ReactNode;
  filters?: React.ReactNode;
};

export function ReportShell({ title, subtitle, onExportCsv, children, filters }: Props) {
  return (
    <div className="space-y-5">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All reports
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {filters}
          {onExportCsv && (
            <button onClick={onExportCsv} className="btn-outline !py-2.5">
              <Download className="h-4 w-4" />
              CSV
            </button>
          )}
          <button onClick={() => window.print()} className="btn-primary !py-2.5">
            <Printer className="h-4 w-4" />
            Print / PDF
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] bg-white p-5 shadow-elevated print-receipt sm:p-6"
      >
        {/* Print-only header */}
        <div className="hidden print:block mb-6 border-b-2 border-primary-500 pb-4">
          <p className="font-display text-2xl font-bold text-primary-700">NBOOG SACCO</p>
          <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
            Mukono District, Uganda · Trust · Growth · Community
          </p>
          <p className="mt-3 font-display text-lg font-bold uppercase tracking-wider">
            {title}
          </p>
          {subtitle && <p className="text-sm text-gray-700">{subtitle}</p>}
        </div>
        {children}
      </motion.div>

      <style jsx global>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          .no-print { display: none !important; }
          aside, header { display: none !important; }
          main { padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
