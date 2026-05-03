import { Database, Users2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listSettings } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = listSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne text-3xl font-bold tracking-tight text-txt">Settings</h1>
        <p className="font-mono text-[10px] tracking-widest uppercase text-dim mt-1">
          Profile and SACCO configuration
        </p>
      </div>

      <section className="rounded-[8px] border border-line bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-growth" />
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sub">
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

      <section className="rounded-[8px] border border-line bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-growth" />
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sub">
            Cooperative settings
          </h2>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {settings.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="font-mono text-[11px] text-sub">{s.key}</span>
              <span className="font-mono text-[11px] font-semibold text-txt">{s.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] bg-raised border border-line p-4">
      <dt className="font-mono text-[9px] uppercase tracking-widest text-dim">{label}</dt>
      <dd className="mt-1 font-dm font-semibold text-txt">{value}</dd>
    </div>
  );
}
