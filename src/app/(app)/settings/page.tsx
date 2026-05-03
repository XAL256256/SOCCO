import { Lock, ShieldCheck, Users2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await prisma.setting.findMany();
  const sessions = await prisma.session.findMany({
    where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  const recentLogins = await prisma.auditLog.findMany({
    where: { userId: user.id, action: "LOGIN_SUCCESS" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500">
          Profile, security and SACCO-wide configuration.
        </p>
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-elevated">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-primary-700" />
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
            Profile
          </h2>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Full name" value={user.fullName} />
          <Field label="Username" value={user.username} />
          <Field label="Email" value={user.email} />
          <Field label="Role" value={user.role} />
        </dl>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-elevated">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-secondary-600" />
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
            Security
          </h2>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          {sessions.length} active session{sessions.length === 1 ? "" : "s"}.
        </p>
        <ul className="mt-3 divide-y divide-gray-100">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-mono text-xs text-gray-500">
                  {s.userAgent?.slice(0, 80) ?? "Unknown agent"}
                </p>
                <p className="text-xs text-gray-400">
                  IP {s.ipAddress ?? "—"} · expires{" "}
                  {s.expiresAt.toISOString().slice(0, 10)}
                </p>
              </div>
              <Lock className="h-4 w-4 text-secondary-500" />
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-secondary-50 px-4 py-3 text-sm text-secondary-800">
          We log every authentication attempt. Recent logins for this account:
          <ul className="mt-2 space-y-1 font-mono text-xs">
            {recentLogins.map((l) => (
              <li key={l.id}>
                {l.createdAt.toISOString().replace("T", " ").slice(0, 16)} · IP{" "}
                {l.ipAddress ?? "—"}
              </li>
            ))}
            {recentLogins.length === 0 && <li>—</li>}
          </ul>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-elevated">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-500">
          SACCO settings
        </h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {settings.map((s) => (
            <li key={s.key} className="flex items-center justify-between py-3 text-sm">
              <span className="text-gray-600 font-mono">{s.key}</span>
              <span className="font-mono font-semibold">{s.value}</span>
            </li>
          ))}
          {settings.length === 0 && (
            <li className="py-3 text-sm text-gray-500">No settings yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <dt className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
