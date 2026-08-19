"use client";

import { listings } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminButton } from "@/components/ui/admin-button";
import { SafeLink } from "@/components/ui/safe-link";
import { ActionDialog } from "@/components/ui/action-dialog";
import { MarketplaceImage } from "@/components/admin/marketplace-image";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function ListingsPage() {
  const { getStatus, getDecision, commitDecision, toast } = useAdminDemo();
  const active = listings.filter((listing) => getStatus("listing", listing.id, listing.status) === "Active").length;
  const review = listings.filter((listing) => ["Pending", "Review"].includes(getStatus("listing", listing.id, listing.status))).length;
  const reported = listings.filter((listing) => listing.reports > 0).length;
  const unavailable = listings.filter((listing) => ["Rejected", "Removed"].includes(getStatus("listing", listing.id, listing.status))).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description="Review marketplace listings using the same catalog, identifiers and content shown on the public marketplace."
        actions={
          <AdminButton variant="outline" onClick={() => toast("Listing export prepared", undefined, "info")}>
            <Icons.download size={16} /> Export
          </AdminButton>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active listings", active, "Visible in marketplace"],
          ["Under review", review, "Pending or in review"],
          ["Reported", reported, "Needs moderation"],
          ["Unavailable", unavailable, "Rejected or removed"],
        ].map(([label, value, meta]) => (
          <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <strong className="mt-2 block text-xl font-black">{value}</strong>
            <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <DataTable
        rows={listings}
        searchText={(listing) => `${listing.id} ${listing.title} ${listing.seller} ${listing.category}`}
        searchPlaceholder="Search listing, seller or listing ID…"
        statusOf={(listing) => getStatus("listing", listing.id, listing.status)}
        statuses={["Active", "Pending", "Review", "Rejected", "Removed"]}
        selectedLabel="listings"
        bulkActions={(selected, clear) => {
          const eligible = selected.filter((id) => {
            const listing = listings.find((item) => item.id === id);
            if (!listing) return false;
            const status = getStatus("listing", id, listing.status);
            const migratedApproval = status === "Active" && listing.status !== "Active";
            return !getDecision("listing", id) && !migratedApproval && !["Rejected", "Removed"].includes(status);
          });

          if (eligible.length === 0) {
            return <span className="text-xs font-bold text-slate-600">Selected listings already have final decisions.</span>;
          }

          return <ActionDialog
            trigger={<button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white">Remove eligible ({eligible.length})</button>}
            title="Remove selected listings permanently?"
            description={`This will permanently remove ${eligible.length} eligible listing${eligible.length === 1 ? "" : "s"}. Listings with an existing final decision are excluded.`}
            confirmLabel="Remove listings"
            tone="danger"
            requireReason
            onConfirm={() => {
              eligible.forEach((id) => commitDecision("listing", id, "Removed", "Removed", `${id} removed`, "danger"));
              clear();
            }}
          />;
        }}
        columns={[
          {
            key: "listing",
            label: "Listing",
            cell: (listing) => (
              <div className="flex min-w-[280px] items-center gap-3">
                <MarketplaceImage
                  src={listing.image}
                  alt={`${listing.title} thumbnail`}
                  className="size-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                  fallbackClassName="size-12 shrink-0 rounded-lg border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="max-w-[260px] truncate font-bold text-slate-900">{listing.title}</div>
                  <div className="mt-0.5 max-w-[260px] truncate text-[10px] text-slate-400">
                    {listing.id} · {listing.seller}
                  </div>
                </div>
              </div>
            ),
          },
          { key: "category", label: "Category", cell: (listing) => listing.category },
          { key: "price", label: "Price", cell: (listing) => <strong className="text-slate-800">{listing.price}</strong> },
          { key: "reports", label: "Reports", cell: (listing) => <span className={listing.reports ? "font-black text-red-600" : "text-slate-400"}>{listing.reports}</span> },
          { key: "created", label: "Created", cell: (listing) => listing.created },
          { key: "status", label: "Status", cell: (listing) => <StatusBadge status={getStatus("listing", listing.id, listing.status)} /> },
          {
            key: "action",
            label: "",
            cell: (listing) => (
              <SafeLink
                href={`/listings/${listing.id}`}
                aria-label={`View listing ${listing.title}`}
                className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <Icons.chevronRight size={16} />
              </SafeLink>
            ),
          },
        ]}
      />
    </div>
  );
}
