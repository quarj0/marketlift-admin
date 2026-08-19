"use client";

import { listings } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionDialog } from "@/components/ui/action-dialog";
import { SafeLink } from "@/components/ui/safe-link";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

const flagged = listings.filter(
  (listing) =>
    listing.reports > 0 ||
    listing.availabilityReports > 0 ||
    listing.status === "Under review" ||
    listing.status === "Rejected",
);

export default function ModerationPage() {
  const { getStatus, setStatus } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation"
        description="Review exceptional risk cases, reports and policy violations. Ordinary listings are not held for manual approval by default."
      />

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-start gap-3">
          <Icons.shield size={18} className="mt-0.5 text-amber-700" />
          <div>
            <p className="text-xs font-black text-amber-950">Manual review is the exception</p>
            <p className="mt-1 text-xs leading-5 text-amber-800/80">
              Listings reach this queue because of risk signals, reports or category rules. Publishing does not normally require administrator approval.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        rows={flagged}
        searchText={(listing) => `${listing.id} ${listing.title} ${listing.seller} ${listing.category}`}
        searchPlaceholder="Search moderation queue…"
        statusOf={(listing) => getStatus("listing", listing.id, listing.status)}
        statuses={["Under review", "Rejected", "Published", "Removed"]}
        selectedLabel="flagged listings"
        columns={[
          {
            key: "listing",
            label: "Listing",
            cell: (listing) => (
              <div>
                <div className="max-w-[300px] truncate font-bold text-slate-900">{listing.title}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{listing.id} · {listing.seller}</div>
              </div>
            ),
          },
          { key: "category", label: "Category", cell: (listing) => listing.category },
          { key: "reports", label: "Reports", cell: (listing) => <span className={listing.reports ? "font-black text-red-600" : "text-slate-400"}>{listing.reports}</span> },
          { key: "availability", label: "Unavailable", cell: (listing) => <span className={listing.availabilityReports ? "font-black text-amber-700" : "text-slate-400"}>{listing.availabilityReports}</span> },
          { key: "status", label: "Status", cell: (listing) => <StatusBadge status={getStatus("listing", listing.id, listing.status)} /> },
          {
            key: "actions",
            label: "Decision",
            cell: (listing) => (
              <div className="flex items-center gap-1.5">
                <ActionDialog
                  trigger={
                    <button type="button" className="min-h-11 rounded-xl bg-blue-50 px-3 text-[11px] font-black text-blue-700 transition hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                      Publish
                    </button>
                  }
                  title="Publish listing?"
                  description="Return this listing to the public marketplace after resolving the review reason."
                  confirmLabel="Publish"
                  requireReason
                  onConfirm={() => setStatus("listing", listing.id, "Published", `${listing.id} published`)}
                />
                <ActionDialog
                  trigger={
                    <button type="button" className="min-h-11 rounded-xl bg-red-50 px-3 text-[11px] font-black text-red-700 transition hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-500">
                      Reject
                    </button>
                  }
                  title="Reject listing?"
                  description="The listing will remain unavailable and the reason will be retained in the moderation history."
                  confirmLabel="Reject"
                  tone="danger"
                  requireReason
                  onConfirm={() => setStatus("listing", listing.id, "Rejected", `${listing.id} rejected`)}
                />
                <SafeLink
                  href={`/listings/${listing.id}`}
                  aria-label={`Inspect ${listing.title}`}
                  className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                >
                  <Icons.eye size={15} />
                </SafeLink>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
