"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionDialog } from "@/components/ui/action-dialog";
import { SafeLink } from "@/components/ui/safe-link";
import { Icons } from "@/lib/icons";
import { useAdminData } from "@/components/admin/admin-data-provider";


export default function ModerationPage() {
  const { getStatus, getDecision, commitDecision, listings } = useAdminData();
  const flagged = listings.filter((listing) => listing.reports > 0 || ["Review", "Rejected", "Removed"].includes(listing.status));

  return <div className="space-y-6">
    <PageHeader title="Moderation" description="Review flagged listings and enforce marketplace policy consistently." />

    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-start gap-3">
        <Icons.shield size={18} className="mt-0.5 text-amber-700" />
        <div>
          <p className="text-xs font-black text-amber-950">Moderation decisions are final</p>
          <p className="mt-1 text-xs leading-5 text-amber-800/70">Approve and reject are mutually exclusive final outcomes for the current moderation case. Rejection requires an internal reason for the audit trail.</p>
        </div>
      </div>
    </div>

    <DataTable
      rows={flagged}
      searchText={(listing) => `${listing.id} ${listing.title} ${listing.seller} ${listing.category}`}
      searchPlaceholder="Search moderation queue…"
      statusOf={(listing) => getStatus("listing", listing.id, listing.status)}
      statuses={["Pending", "Review", "Active", "Rejected", "Removed"]}
      selectedLabel="flagged listings"
      columns={[
        {
          key: "listing",
          label: "Listing",
          cell: (listing) => <div><div className="max-w-[300px] truncate font-bold text-slate-900">{listing.title}</div><div className="mt-0.5 text-[10px] text-slate-400">{listing.id} · {listing.seller}</div></div>,
        },
        { key: "category", label: "Category", cell: (listing) => listing.category },
        { key: "reports", label: "Reports", cell: (listing) => <span className="font-black text-red-600">{listing.reports}</span> },
        { key: "status", label: "Status", cell: (listing) => <StatusBadge status={getStatus("listing", listing.id, listing.status)} /> },
        {
          key: "actions",
          label: "Decision",
          cell: (listing) => {
            const currentStatus = getStatus("listing", listing.id, listing.status);
            const decision = getDecision("listing", listing.id);
            const finalAction = decision?.action ?? (currentStatus === "Rejected" || currentStatus === "Removed" ? currentStatus : currentStatus === "Active" && listing.status !== "Active" ? "Approved" : null);

            return <div className="flex flex-wrap items-center gap-1.5">
              {finalAction ? (
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-black text-slate-700">
                  <Icons.lock size={13} aria-hidden="true" /> Final: {finalAction}
                </span>
              ) : <>
                <ActionDialog
                  trigger={<button className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 hover:bg-emerald-100">Approve</button>}
                  title="Approve listing permanently?"
                  description="This finalizes the current moderation case as approved. It cannot later be changed to rejected."
                  confirmLabel="Approve"
                  onConfirm={(reason) => void commitDecision("listing", listing.id, "Approved", "Active", `${listing.id} approved`, "success", reason)}
                />
                <ActionDialog
                  trigger={<button className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 hover:bg-red-100">Reject</button>}
                  title="Reject listing permanently?"
                  description="This finalizes the current moderation case as rejected. It cannot later be changed to approved."
                  confirmLabel="Reject"
                  tone="danger"
                  requireReason
                  onConfirm={(reason) => void commitDecision("listing", listing.id, "Rejected", "Rejected", `${listing.id} rejected`, "danger", reason)}
                />
              </>}
              <SafeLink href={`/listings/${listing.id}`} aria-label={`Review ${listing.title}`} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Icons.eye size={15} /></SafeLink>
            </div>;
          },
        },
      ]}
    />
  </div>;
}
