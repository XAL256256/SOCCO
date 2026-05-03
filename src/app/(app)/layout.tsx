import { cookies } from "next/headers";
import { DEMO_ROLE_COOKIE, getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const presentationCookie = cookieStore.get(DEMO_ROLE_COOKIE)?.value ?? null;

  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center">
        <p className="max-w-md font-display text-lg font-semibold text-gray-900">
          App could not load staff data
        </p>
        <p className="max-w-lg text-gray-600">
          Usually this means <strong>DATABASE_URL</strong> is missing on Vercel, the database is not reachable, or no users exist yet. Link Postgres in Vercel, redeploy, then run{" "}
          <code className="rounded bg-gray-200 px-1 font-mono text-sm">npm run db:seed</code> once against that database.
        </p>
        <p className="text-xs text-gray-400 font-mono">
          Check Vercel → Deployment → Logs for the underlying error.
        </p>
      </div>
    );
  }

  return (
    <AppShell
      user={{ fullName: user.fullName, role: user.role }}
      presentationCookie={presentationCookie}
    >
      {children}
    </AppShell>
  );
}
