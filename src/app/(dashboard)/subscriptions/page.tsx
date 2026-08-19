"use client";

import { useState } from "react";
import { plans, sellers } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function SubscriptionsPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const { toast } = useAdminDemo();
  const selectedPlan = plans.find((item) => item.name === plan);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Manage the seller plans and limits offered by the marketplace."
        actions={<AdminButton onClick={() => setPlan("__new__")}>+ Create plan</AdminButton>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((item) => (
          <article key={item.id || item.name} className="relative rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-lg hover:shadow-slate-950/5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">{item.name}</span>
              {item.badge && <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">{item.badge}</span>}
            </div>
            <div className="mt-4">
              <strong className="text-2xl font-black text-slate-950">{item.price}</strong>
              <span className="text-xs text-slate-400">{item.period}</span>
            </div>
            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs">
              <Row label="Current sellers" value={item.sellers.toLocaleString("pt-BR")} />
              <Row label="Listing limit" value={item.listings} />
              <Row label="Featured listings" value={item.featured} />
            </div>
            <button
              type="button"
              onClick={() => setPlan(item.name)}
              className="mt-5 w-full rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Edit plan
            </button>
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-sm font-black">Recent subscriptions</h2>
            <p className="mt-0.5 text-xs text-slate-500">Seller plan membership using the marketplace plan catalog</p>
          </div>
          <AdminButton variant="outline" onClick={() => toast("Subscription export prepared", undefined, "info")}>
            <Icons.download size={15} /> Export
          </AdminButton>
        </div>
        <div className="table-scroll">
          <table className="admin-table" aria-label="Recent seller subscriptions">
            <thead><tr><th scope="col">Seller</th><th scope="col">Plan</th><th scope="col">Billing</th><th scope="col">Next renewal</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {sellers.map((seller, index) => {
                const sellerPlan = plans.find((item) => item.name === seller.plan);
                return (
                  <tr key={seller.id}>
                    <td><div className="font-bold text-slate-900">{seller.name}</div><div className="text-[10px] text-slate-400">{seller.id}</div></td>
                    <td>{seller.plan}</td>
                    <td>{sellerPlan ? `${sellerPlan.price}${sellerPlan.period}` : "—"}</td>
                    <td>{`${22 - (index % 12)} Sep 2026`}</td>
                    <td><StatusBadge status={seller.status === "Suspended" ? "Suspended" : "Active"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={plan !== null}
        onClose={() => setPlan(null)}
        title={plan === "__new__" ? "Create subscription plan" : `Edit ${plan}`}
        description="Configure seller plan pricing and marketplace limits."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setPlan(null)}>Cancel</AdminButton>
            <AdminButton onClick={() => { toast(plan === "__new__" ? "Plan prepared" : "Plan updated", "Subscription plan configuration saved in the administration preview."); setPlan(null); }}>Save plan</AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Plan name" value={plan === "__new__" ? "" : selectedPlan?.name ?? ""} />
          <Field label="Monthly price" value={selectedPlan?.price ?? ""} />
          <Field label="Listing limit" value={selectedPlan?.listings ?? ""} />
          <Field label="Featured credits" value={selectedPlan?.featured ?? ""} />
        </div>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><strong className="text-slate-800">{value}</strong></div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <label><span className="mb-2 block text-xs font-bold text-slate-700">{label}</span><input defaultValue={value} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" /></label>;
}
