"use client";

import { useState } from "react";
import { AdminButton } from "@/components/ui/admin-button";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";
import { ActionDialog } from "@/components/ui/action-dialog";

function Switch({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      aria-label={label}
      className="grid size-11 shrink-0 place-items-center rounded-xl transition focus-visible:ring-2 focus-visible:ring-[#0b63f6] focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={`relative block h-7 w-12 rounded-full transition ${enabled ? "bg-[#0b63f6]" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-1.5 size-4 rounded-full bg-white shadow transition ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

type Tab = "General" | "Marketplace" | "Trust & safety" | "Notifications" | "Admin access";

export function SettingsClient() {
  const [tab, setTab] = useState<Tab>("General");
  const [registration, setRegistration] = useState(true);
  const [sellingActivation, setSellingActivation] = useState(true);
  const [autoFlag, setAutoFlag] = useState(true);
  const [availabilitySignals, setAvailabilitySignals] = useState(true);
  const [highRiskVerification, setHighRiskVerification] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [email, setEmail] = useState(true);
  const { toast } = useAdminDemo();

  const tabs: [Tab, typeof Icons.settings][] = [
    ["General", Icons.settings],
    ["Marketplace", Icons.store],
    ["Trust & safety", Icons.shield],
    ["Notifications", Icons.bell],
    ["Admin access", Icons.lock],
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
      <aside className="self-start rounded-2xl border border-slate-200 bg-white p-2 xl:sticky xl:top-24" aria-label="Settings sections">
        {tabs.map(([label, Icon]) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            aria-pressed={tab === label}
            className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-[#0b63f6] ${
              tab === label
                ? "bg-blue-50 text-blue-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </aside>

      <div className="space-y-6">
        {tab === "General" && (
          <section className="rounded-2xl border border-slate-200 bg-white">
            <Head title="General settings" desc="Platform identity and public configuration." />
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <Field label="Platform name" value="Marketlift" />
              <Field label="Support email" value="support@marketlift.br" />
              <Field label="Primary domain" value="marketlift.br" />
              <Field label="Admin domain" value="dash.marketlift.br" />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-slate-700">Marketplace description</span>
                <textarea
                  defaultValue="Buy and sell locally across Brazil with clear seller trust signals, reporting and marketplace moderation."
                  className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
                />
              </label>
            </div>
            <Save onClick={() => toast("General settings saved", "Mock configuration updated.")} />
          </section>
        )}

        {tab === "Marketplace" && (
          <section className="rounded-2xl border border-slate-200 bg-white">
            <Head title="Marketplace controls" desc="Global availability and account capability controls." />
            <div className="divide-y divide-slate-100 px-5">
              <Toggle
                title="User registration"
                description="Allow new users to create the single Marketlift account used for buying and selling."
                enabled={registration}
                action={() => setRegistration(!registration)}
              />
              <Toggle
                title="Selling activation"
                description="Allow registered users to enable selling tools on their existing account. No separate seller account is created."
                enabled={sellingActivation}
                action={() => setSellingActivation(!sellingActivation)}
              />
              <Toggle
                title="Maintenance mode"
                description="Temporarily disable public marketplace access."
                enabled={maintenance}
                action={() => setMaintenance(!maintenance)}
              />
            </div>
          </section>
        )}

        {tab === "Trust & safety" && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white">
              <Head
                title="Trust & safety controls"
                desc="Automated moderation and risk rules without making manual approval the default publishing path."
              />
              <div className="divide-y divide-slate-100 px-5">
                <Toggle
                  title="Automated listing flagging"
                  description="Send listings to under-review only when risk signals, reports or category rules require it."
                  enabled={autoFlag}
                  action={() => setAutoFlag(!autoFlag)}
                />
                <Toggle
                  title="Availability-report signals"
                  description="Accept buyer reports when a seller says an item is unavailable but leaves the listing live. One report never removes a listing automatically."
                  enabled={availabilitySignals}
                  action={() => setAvailabilitySignals(!availabilitySignals)}
                />
                <Toggle
                  title="Require verification for high-risk cases"
                  description="Verification stays optional by default and can be required for high-risk categories, activity or policy triggers."
                  enabled={highRiskVerification}
                  action={() => setHighRiskVerification(!highRiskVerification)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-red-200 bg-red-50/20 p-5">
              <div className="flex items-start gap-3">
                <Icons.alert className="mt-0.5 shrink-0 text-red-600" size={18} />
                <div className="flex-1">
                  <h2 className="text-sm font-black text-red-900">Danger zone</h2>
                  <p className="mt-1 text-xs leading-5 text-red-700/70">
                    Platform-wide actions require a reason and should require re-authentication after backend integration.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionDialog
                      trigger={<AdminButton variant="danger">Enable maintenance mode</AdminButton>}
                      title="Enable maintenance mode?"
                      description="Public marketplace access would be temporarily unavailable."
                      confirmLabel="Enable maintenance"
                      tone="danger"
                      requireReason
                      onConfirm={() => {
                        setMaintenance(true);
                        toast("Maintenance mode enabled", "Mock platform status updated.", "danger");
                      }}
                    />
                    <ActionDialog
                      trigger={<AdminButton variant="outline">Invalidate all sessions</AdminButton>}
                      title="Invalidate all sessions?"
                      description="All users and administrators would need to sign in again."
                      confirmLabel="Invalidate sessions"
                      tone="danger"
                      requireReason
                      onConfirm={() => toast("Sessions invalidated", "Mock security action completed.", "danger")}
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {tab === "Notifications" && (
          <section className="rounded-2xl border border-slate-200 bg-white">
            <Head title="Administrator notifications" desc="Choose which operational events should alert administrators." />
            <div className="divide-y divide-slate-100 px-5">
              <Toggle
                title="Email operational alerts"
                description="Receive high-priority trust, payment and platform alerts."
                enabled={email}
                action={() => setEmail(!email)}
              />
              <Toggle
                title="Verification queue alerts"
                description="Alert when verification backlog crosses the target threshold."
                enabled
                action={() => toast("Notification preference updated")}
              />
              <Toggle
                title="Payment failure alerts"
                description="Alert finance administrators about failed plan and promotion payments."
                enabled
                action={() => toast("Notification preference updated")}
              />
            </div>
          </section>
        )}

        {tab === "Admin access" && (
          <section className="rounded-2xl border border-slate-200 bg-white">
            <Head title="Administrator access" desc="Role and session controls for the separate Marketlift admin console." />
            <div className="p-5">
              <div className="table-scroll rounded-xl border border-slate-200" role="region" aria-label="Administrators" tabIndex={0}>
                <table className="admin-table">
                  <thead><tr><th scope="col">Administrator</th><th scope="col">Role</th><th scope="col">Last active</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    {[
                      ["Ana Martins", "Super admin", "Now"],
                      ["Carlos Mendes", "Moderator", "34 min ago"],
                      ["Mariana Alves", "Support", "1 hr ago"],
                    ].map(([name, role, active]) => (
                      <tr key={name}>
                        <td className="font-bold text-slate-900">{name}</td>
                        <td>{role}</td>
                        <td>{active}</td>
                        <td><span className="text-xs font-black text-emerald-700">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminButton className="mt-4" onClick={() => toast("Invite-admin flow ready", "Invite UI will connect to authentication later.", "info")}>
                + Invite administrator
              </AdminButton>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Head({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4">
      <h2 className="text-sm font-black">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
    </div>
  );
}

function Save({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end border-t border-slate-100 px-5 py-4">
      <AdminButton onClick={onClick}>Save changes</AdminButton>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-slate-700">{label}</span>
      <input
        defaultValue={value}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
      />
    </label>
  );
}

function Toggle({
  title,
  description,
  enabled,
  action,
}: {
  title: string;
  description: string;
  enabled: boolean;
  action: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-xs font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">{description}</p>
      </div>
      <Switch enabled={enabled} onChange={action} label={title} />
    </div>
  );
}
