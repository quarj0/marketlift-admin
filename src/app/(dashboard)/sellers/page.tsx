"use client";

import { sellers } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminButton } from "@/components/ui/admin-button";
import { SafeLink } from "@/components/ui/safe-link";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function SellersPage() {
  const { getStatus, toast } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Selling profiles"
        description="Monitor the selling capability attached to normal Marketlift user accounts—plans, inventory, verification and standing."
        actions={
          <AdminButton variant="outline" onClick={() => toast("Seller export prepared", undefined, "info")}>
            <Icons.download size={16} /> Export
          </AdminButton>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Selling enabled", "4,281", "+5.2%"],
          ["Verified profiles", "4,109", "Optional trust signal"],
          ["Pending verification", "18", "Needs review"],
          ["Paid plans", "2,151", "Basic + Pro + Business"],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <strong className="mt-2 block text-xl font-black">{value}</strong>
            <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <DataTable
        rows={sellers}
        searchText={(seller) => `${seller.id} ${seller.name} ${seller.owner} ${seller.plan} ${seller.location} ${seller.verification}`}
        searchPlaceholder="Search selling profile, owner or seller ID…"
        statusOf={(seller) => getStatus("seller", seller.id, seller.status)}
        statuses={["Active", "Suspended"]}
        selectedLabel="selling profiles"
        columns={[
          {
            key: "seller",
            label: "Selling profile",
            cell: (seller) => (
              <div>
                <div className="font-bold text-slate-900">{seller.name}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{seller.id} · {seller.owner}</div>
              </div>
            ),
          },
          { key: "plan", label: "Plan", cell: (seller) => <span className="font-bold text-slate-700">{seller.plan}</span> },
          { key: "verification", label: "Verification", cell: (seller) => <StatusBadge status={seller.verification} /> },
          { key: "location", label: "Location", cell: (seller) => seller.location },
          { key: "listings", label: "Listings", cell: (seller) => seller.listings.toLocaleString("pt-BR") },
          { key: "rating", label: "Rating", cell: (seller) => <span className="font-bold text-slate-700">★ {seller.rating}</span> },
          { key: "status", label: "Selling status", cell: (seller) => <StatusBadge status={getStatus("seller", seller.id, seller.status)} /> },
          {
            key: "action",
            label: "",
            cell: (seller) => (
              <SafeLink href={`/sellers/${seller.id}`} aria-label={`View ${seller.name}`} className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                <Icons.chevronRight size={16} />
              </SafeLink>
            ),
          },
        ]}
      />
    </div>
  );
}
