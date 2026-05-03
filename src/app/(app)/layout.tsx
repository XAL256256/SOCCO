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

  const user = (await getCurrentUser())!;

  return (
    <AppShell
      user={{ fullName: user.fullName, role: user.role }}
      presentationCookie={presentationCookie}
    >
      {children}
    </AppShell>
  );
}
