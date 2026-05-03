import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center">
        <p className="max-w-md text-gray-700">
          No staff user exists yet in this database. Run seed locally once against your{" "}
          <code className="rounded bg-gray-200 px-1 font-mono text-sm">DATABASE_URL</code>:
        </p>
        <pre className="rounded-2xl border border-gray-200 bg-white px-4 py-3 font-mono text-xs text-gray-800 shadow-soft">
          npm run db:seed
        </pre>
      </div>
    );
  }

  return (
    <AppShell user={{ fullName: user.fullName, role: user.role }}>
      {children}
    </AppShell>
  );
}
