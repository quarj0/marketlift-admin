"use client";

import { useState } from "react";
import { AdminButton } from "@/components/ui/admin-button";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";
import { ActionDialog } from "@/components/ui/action-dialog";

function Switch({ enabled, onChange, label, disabled = false }: { enabled: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${enabled ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-slate-200"}`}
  >
    <span aria-hidden="true" className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${enabled ? "left-6" : "left-1"}`}/>
  </button>;
}

type Tab = "Platform" | "Marketplace" | "Trust & safety" | "Notifications" | "Admin access";

export function SettingsClient() {
  const [tab, setTab] = useState<Tab>("Platform");
  const [registration, setRegistration] = useState(true);
  const [sellerSignup, setSellerSignup] = useState(true);
  const [autoFlag, setAutoFlag] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [email, setEmail] = useState(true);
  const [verificationAlerts, setVerificationAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const { toast } = useAdminDemo();

  const tabs: [Tab, typeof Icons.settings][] = [
    ["Platform", Icons.settings],
    ["Marketplace", Icons.store],
    ["Trust & safety", Icons.shield],
    ["Notifications", Icons.bell],
    ["Admin access", Icons.lock],
  ];

  return <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
    <aside className="self-start rounded-xl border border-slate-200 bg-white p-2 xl:sticky xl:top-24" aria-label="Settings sections">
      <div>
        {tabs.map(([label, Icon]) => <button
          key={label}
          type="button"
          aria-pressed={tab === label}
          onClick={() => setTab(label)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition ${tab === label ? "bg-emerald-50 text-emerald-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          <Icon size={16} aria-hidden="true"/>{label}
        </button>)}
      </div>
    </aside>

    <div className="space-y-6">
      {tab === "Platform" && <section className="rounded-xl border border-slate-200 bg-white">
        <Head title="Platform information" desc="Core Marketlift identity and deployment details."/>
        <div className="p-5">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
            <Icons.lock className="mt-0.5 shrink-0 text-blue-700" size={17} aria-hidden="true"/>
            <div>
              <p className="text-xs font-black text-blue-950">Deployment-managed values</p>
              <p className="mt-1 text-xs leading-5 text-blue-900/75">Brand identity and domains are shown here for reference. They should be changed through deployment configuration, not from a live administrator session.</p>
            </div>
          </div>
          <dl className="overflow-hidden rounded-xl border border-slate-200">
            <ReadOnlySetting label="Platform name" value="Marketlift" source="Product configuration" description="Canonical product name used across the marketplace and admin console."/>
            <ReadOnlySetting label="Marketplace domain" value="marketlift.br" source="Deployment / DNS" description="Public buyer and seller marketplace."/>
            <ReadOnlySetting label="Admin domain" value="dash.marketlift.br" source="Deployment / DNS" description="Restricted administration console."/>
            <ReadOnlySetting label="Support address" value="support@marketlift.br" source="Support routing" description="Public contact used for customer support communication." last/>
          </dl>
        </div>
      </section>}

      {tab === "Marketplace" && <section className="rounded-xl border border-slate-200 bg-white">
        <Head title="Marketplace controls" desc="Control account onboarding and view marketplace availability."/>
        <div className="divide-y divide-slate-100 px-5">
          <Toggle title="User registration" description="Allow new buyers to create Marketlift accounts." enabled={registration} action={() => setRegistration(!registration)}/>
          <Toggle title="Seller registration" description="Allow eligible users to start seller onboarding." enabled={sellerSignup} action={() => setSellerSignup(!sellerSignup)}/>
          <StatusRow title="Marketplace availability" description="Maintenance mode is guarded under Trust & safety because it affects every visitor." value={maintenance ? "Maintenance" : "Online"} tone={maintenance ? "danger" : "success"}/>
        </div>
      </section>}

      {tab === "Trust & safety" && <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white">
          <Head title="Trust & safety controls" desc="Moderation safeguards and seller verification policy."/>
          <div className="divide-y divide-slate-100 px-5">
            <Toggle title="Automated listing flagging" description="Send high-risk marketplace content to moderation review." enabled={autoFlag} action={() => setAutoFlag(!autoFlag)}/>
            <Toggle title="Require seller verification" description="Identity verification is mandatory before protected seller capabilities are available." enabled disabled action={() => {}}/>
          </div>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50/25 p-5" aria-labelledby="danger-zone-title">
          <div className="flex items-start gap-3">
            <Icons.alert className="mt-0.5 shrink-0 text-red-700" size={18} aria-hidden="true"/>
            <div className="flex-1">
              <h2 id="danger-zone-title" className="text-sm font-black text-red-950">Danger zone</h2>
              <p className="mt-1 text-xs leading-5 text-red-900/70">These actions affect platform availability or active sessions. A written reason is required before confirmation.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionDialog
                  trigger={<AdminButton variant={maintenance ? "outline" : "danger"}>{maintenance ? "Disable maintenance mode" : "Enable maintenance mode"}</AdminButton>}
                  title={maintenance ? "Disable maintenance mode?" : "Enable maintenance mode?"}
                  description={maintenance ? "Public marketplace access will be restored." : "Public marketplace access will be temporarily unavailable."}
                  confirmLabel={maintenance ? "Restore marketplace" : "Enable maintenance"}
                  tone={maintenance ? "primary" : "danger"}
                  requireReason
                  onConfirm={() => {
                    setMaintenance(!maintenance);
                    toast(maintenance ? "Marketplace restored" : "Maintenance mode enabled", maintenance ? "Public marketplace status is online." : "Public marketplace status is in maintenance.", maintenance ? "success" : "danger");
                  }}
                />
                <ActionDialog
                  trigger={<AdminButton variant="outline">Invalidate all sessions</AdminButton>}
                  title="Invalidate all sessions?"
                  description="All users and administrators will need to sign in again. Use this only for a security incident or deliberate session reset."
                  confirmLabel="Invalidate sessions"
                  tone="danger"
                  requireReason
                  onConfirm={() => toast("Sessions invalidated", "All active sessions were marked for invalidation.", "danger")}
                />
              </div>
            </div>
          </div>
        </section>
      </div>}

      {tab === "Notifications" && <section className="rounded-xl border border-slate-200 bg-white">
        <Head title="Administrator notifications" desc="Choose which operational events should alert administrators."/>
        <div className="divide-y divide-slate-100 px-5">
          <Toggle title="Email operational alerts" description="Receive high-priority trust, payment and platform alerts by email." enabled={email} action={() => setEmail(!email)}/>
          <Toggle title="Verification queue alerts" description="Alert when verification backlog crosses the target threshold." enabled={verificationAlerts} action={() => setVerificationAlerts(!verificationAlerts)}/>
          <Toggle title="Payment failure alerts" description="Alert finance administrators about failed recurring payments." enabled={paymentAlerts} action={() => setPaymentAlerts(!paymentAlerts)}/>
        </div>
      </section>}

      {tab === "Admin access" && <section className="rounded-xl border border-slate-200 bg-white">
        <Head title="Administrator access" desc="Review administrator roles and session status."/>
        <div className="p-5">
          <div className="table-scroll overflow-hidden rounded-xl border border-slate-200">
            <table className="admin-table" aria-label="Administrator access">
              <thead><tr><th scope="col">Administrator</th><th scope="col">Role</th><th scope="col">Last active</th><th scope="col">Status</th></tr></thead>
              <tbody>{[["Ana Martins", "Super admin", "Now"], ["Carlos Mendes", "Moderator", "34 min ago"], ["Mariana Alves", "Support", "1 hr ago"]].map(([name, role, active]) => <tr key={name}><td className="font-bold text-slate-900">{name}</td><td>{role}</td><td>{active}</td><td><span className="text-xs font-black text-emerald-700">Active</span></td></tr>)}</tbody>
            </table>
          </div>
          <AdminButton className="mt-4" onClick={() => toast("Administrator invite opened", "Invitation details can be completed from the administrator access flow.", "info")}>+ Invite administrator</AdminButton>
        </div>
      </section>}
    </div>
  </div>;
}

function Head({ title, desc }: { title: string; desc: string }) {
  return <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black text-slate-950">{title}</h2><p className="mt-0.5 text-xs text-slate-600">{desc}</p></div>;
}

function ReadOnlySetting({ label, value, source, description, last = false }: { label: string; value: string; source: string; description: string; last?: boolean }) {
  return <div className={`grid gap-2 px-4 py-4 sm:grid-cols-[190px_1fr_auto] sm:items-center ${last ? "" : "border-b border-slate-100"}`}>
    <dt className="text-xs font-bold text-slate-700">{label}</dt>
    <dd><div className="text-sm font-black text-slate-950">{value}</div><div className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</div></dd>
    <dd className="justify-self-start rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 sm:justify-self-end">{source}</dd>
  </div>;
}

function Toggle({ title, description, enabled, action, disabled = false }: { title: string; description: string; enabled: boolean; action: () => void; disabled?: boolean }) {
  return <div className="flex items-center justify-between gap-4 py-4">
    <div><p className="text-xs font-bold text-slate-900">{title}</p><p className="mt-1 text-[11px] leading-4 text-slate-600">{description}</p>{disabled && <p className="mt-1 text-[10px] font-bold text-slate-500">Required platform policy</p>}</div>
    <Switch enabled={enabled} onChange={action} label={title} disabled={disabled}/>
  </div>;
}

function StatusRow({ title, description, value, tone }: { title: string; description: string; value: string; tone: "success" | "danger" }) {
  return <div className="flex items-center justify-between gap-4 py-4"><div><p className="text-xs font-bold text-slate-900">{title}</p><p className="mt-1 text-[11px] leading-4 text-slate-600">{description}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${tone === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{value}</span></div>;
}
