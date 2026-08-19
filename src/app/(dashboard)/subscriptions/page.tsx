"use client";

import { useMemo, useState } from "react";
import { plans, sellers } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export default function SubscriptionsPage() {
  const [planId, setPlanId] = useState<string | null>(null);
  const { toast } = useAdminDemo();
  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === planId), [planId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Selling plans"
        description="Manage the same Free, Basic, Pro and Business plans offered in the Marketlift seller experience."
        actions={
          <AdminButton variant="outline" onClick={() => toast("Plan export prepared", undefined, "info")}>
            <Icons.download size={16} /> Export
          </AdminButton>
        }
      />

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-950">
        <strong>One-account model:</strong> plans add selling capacity and visibility to an existing Marketlift account. They do not create a different seller account type.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#02122f]/5 ${
              plan.recommended ? "border-[#0b63f6]/45 ring-2 ring-[#0b63f6]/8" : "border-slate-200"
            }`}
          >
            {plan.recommended && (
              <span className="absolute right-4 top-4 rounded-full bg-[#ff8a00]/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#9a4d00]">
                Recommended
              </span>
            )}

            <p className="text-xs font-black uppercase tracking-[.08em] text-slate-500">{plan.name}</p>
            <div className="mt-4">
              <strong className="text-2xl font-black text-slate-950">{plan.price}</strong>
              <span className="text-xs text-slate-400">{plan.period}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {plan.yearlyPrice ? `${money.format(plan.yearlyPrice)} / year` : "No subscription charge"}
            </p>

            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs">
              <Row label="Active sellers" value={plan.sellers.toLocaleString("pt-BR")} />
              <Row label="Listing limit" value={plan.listings} />
              <Row label="Featured credits" value={plan.featured} />
              <Row label="Visibility weight" value={plan.visibility} />
            </dl>

            <AdminButton variant="outline" className="mt-5 w-full" onClick={() => setPlanId(plan.id)}>
              Review plan
            </AdminButton>
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black">Recent plan memberships</h2>
            <p className="mt-0.5 text-xs text-slate-500">Current seller profile plan and renewal cycle</p>
          </div>
          <AdminButton variant="outline" onClick={() => toast("Subscription export prepared", undefined, "info")}>
            <Icons.download size={15} /> Export
          </AdminButton>
        </div>

        <div className="table-scroll" role="region" aria-label="Recent seller plan memberships" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Selling profile</th>
                <th scope="col">Plan</th>
                <th scope="col">Billing</th>
                <th scope="col">Next renewal</th>
                <th scope="col">Account status</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, index) => {
                const plan = plans.find((item) => item.name === seller.plan) ?? plans[0];
                const billing = plan.monthlyPrice ? `${money.format(plan.monthlyPrice)} / month` : "Free";
                return (
                  <tr key={seller.id}>
                    <td>
                      <div className="font-bold text-slate-900">{seller.name}</div>
                      <div className="text-[10px] text-slate-400">{seller.id} · {seller.owner}</div>
                    </td>
                    <td className="font-bold text-slate-800">{seller.plan}</td>
                    <td>{billing}</td>
                    <td>{plan.monthlyPrice ? `${22 - index} Sep 2026` : "—"}</td>
                    <td><StatusBadge status={seller.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={selectedPlan !== undefined}
        onClose={() => setPlanId(null)}
        title={selectedPlan ? `${selectedPlan.name} plan` : "Selling plan"}
        description="This configuration mirrors the current consumer seller-plan contract. Backend persistence will become authoritative during API integration."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setPlanId(null)}>Cancel</AdminButton>
            <AdminButton
              onClick={() => {
                toast("Plan configuration saved", "Mock admin configuration updated for review.");
                setPlanId(null);
              }}
            >
              Save plan
            </AdminButton>
          </>
        }
      >
        {selectedPlan && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan name" value={selectedPlan.name} readOnly />
            <Field label="Monthly price (BRL)" value={selectedPlan.monthlyPrice.toFixed(2)} />
            <Field label="Yearly price (BRL)" value={selectedPlan.yearlyPrice.toFixed(2)} />
            <Field label="Active listing limit" value={selectedPlan.listings} />
            <Field label="Featured credits / month" value={selectedPlan.featured} />
            <Field label="Visibility weight" value={selectedPlan.visibility.replace("×", "")} />
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className="font-bold text-slate-800">{value}</dd></div>;
}

function Field({ label, value, readOnly = false }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-slate-700">{label}</span>
      <input
        defaultValue={value}
        readOnly={readOnly}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10 read-only:bg-slate-50 read-only:text-slate-500"
      />
    </label>
  );
}
