import { Database, ShieldCheck, Users2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listSettings } from "@/lib/mock/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = listSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne text-3xl font-bold tracking-tight text-txt">Settings</h1>
        <p className="font-mono text-[10px] tracking-widest uppercase text-dim mt-1">
          Profile · SACCO configuration · demo banner
        </p>
      </div>

      <section className="rounded-[4px] border border-line bg-surface p-6">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-gold" />
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-dim">
            Active persona
          </h2>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Full name" value={user.fullName} />
          <Field label="Username" value={user.username} />
          <Field label="Email" value={user.email} />
          <Field label="Role" value={user.role} />
        </dl>
      </section>

      <section className="rounded-[4px] border border-gold-bd bg-gold-dim p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gold" />
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
            Demo mode
          </h2>
        </div>
        <p className="mt-3 font-dm text-sm text-sub leading-relaxed">
          This deployment runs entirely in-memory. There is no database connection.
          All write actions display a confirmation toast but are not persisted —
          ideal for investor previews where data should remain stable across
          sessions and reloads.
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-widest uppercase text-gold/70">
          Connect a database to enable writes
        </p>
      </section>

      <section className="rounded-[4px] border border-line bg-surface p-6">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-gold" />
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-dim">
            SACCO settings
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
    <div className="rounded-[2px] bg-raised border border-line p-4">
      <dt className="font-mono text-[9px] uppercase tracking-widest text-dim">{label}</dt>
      <dd className="mt-1 font-dm font-semibold text-txt">{value}</dd>
    </div>
  );
}
