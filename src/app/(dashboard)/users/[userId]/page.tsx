import type { ReactNode } from "react";
import { SafeLink } from "@/components/ui/safe-link";
import { notFound } from "next/navigation";
import { users } from "@/data/mock-data";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions, MockAction } from "@/components/admin/entity-actions";
import { Icons } from "@/lib/icons";

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = users.find((item) => item.id === userId) ?? users[0];
  if (!user) notFound();

  const sellingEnabled = user.type === "Selling enabled";

  return (
    <div className="space-y-6">
      <SafeLink href="/users" className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-[#0b63f6] focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
        ← Back to users
      </SafeLink>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-blue-50 text-base font-black text-blue-700">{user.avatar}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-slate-950">{user.name}</h1>
              <LiveStatusBadge kind="user" id={user.id} status={user.status} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{user.email} · {user.id}</p>
          </div>
        </div>
        <EntityActions kind="user" id={user.id} name={user.name} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black text-slate-900">Account information</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Info icon={<Icons.mail size={16} />} label="Email" value={user.email} />
              <Info icon={<Icons.phone size={16} />} label="Phone" value="+55 11 99876-4321" />
              <Info icon={<Icons.store size={16} />} label="Selling capability" value={sellingEnabled ? "Enabled on this account" : "Not enabled"} />
              <Info icon={<Icons.calendar size={16} />} label="Joined" value={user.joined} />
              <Info icon={<Icons.store size={16} />} label="Location" value={user.location} />
              <Info icon={<Icons.shield size={16} />} label="Email verification" value="Verified" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black text-slate-900">Recent account activity</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {[
                "Signed in from Chrome on Android",
                "Saved listing LST-9007",
                "Sent message to TechZone Brasil",
                sellingEnabled ? "Opened selling dashboard" : "Updated account profile",
              ].map((item, index) => (
                <div key={item} className="flex items-center justify-between gap-4 py-3 text-xs">
                  <span className="font-semibold text-slate-700">{item}</span>
                  <span className="shrink-0 text-slate-400">{index + 1} hr ago</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black text-slate-900">Account health</h2>
            <div className="mt-5 space-y-4">
              <Health label="Reports against user" value="0" tone="good" />
              <Health label="Selling enabled" value={sellingEnabled ? "Yes" : "No"} />
              <Health label="Active listings" value={sellingEnabled ? "12" : "0"} />
              <Health label="Warnings" value="0" tone="good" />
              <Health label="Last active" value="12 min ago" />
            </div>
          </section>

          <section className="rounded-2xl border border-red-200 bg-red-50/30 p-5">
            <h2 className="text-sm font-black text-red-900">Danger zone</h2>
            <p className="mt-2 text-xs leading-5 text-red-700/70">Administrative actions are recorded in the audit log.</p>
            <div className="mt-4">
              <MockAction label="Delete account" message="Deletion requires backend re-authentication and retention checks before it can become a real action." tone="danger" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-xs font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Health({ label, value, tone }: { label: string; value: string; tone?: "good" }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}</span>
      <strong className={tone === "good" ? "text-emerald-600" : "text-slate-900"}>{value}</strong>
    </div>
  );
}
