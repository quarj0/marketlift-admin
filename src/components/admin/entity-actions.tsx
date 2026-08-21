"use client";

import { AdminButton } from "@/components/ui/admin-button";
import { ActionDialog } from "@/components/ui/action-dialog";
import { PublicListingLink } from "@/components/admin/public-marketplace-link";
import { Icons } from "@/lib/icons";
import { useAdminData } from "./admin-data-provider";

type EntityKind = "user" | "seller" | "listing" | "report" | "verification";

function FinalDecision({ action }: { action: string }) {
  return (
    <div role="status" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-xs font-black text-slate-700">
      <Icons.lock size={14} aria-hidden="true" />
      Final decision: {action}
    </div>
  );
}

export function EntityActions({
  kind,
  id,
  name,
  status,
  publicSlug,
}: {
  kind: EntityKind;
  id: string;
  name: string;
  status?: string;
  publicSlug?: string;
}) {
  const { getStatus, setStatus, getDecision, commitDecision } = useAdminData();
  const currentStatus = getStatus(kind, id, status ?? "Pending");
  const storedDecision = getDecision(kind, id);

  if (kind === "verification") {
    const finalAction = storedDecision?.action ?? (currentStatus === "Verified" ? "Approved" : currentStatus === "Rejected" ? "Rejected" : null);
    if (finalAction) return <FinalDecision action={finalAction} />;

    return <div className="flex flex-wrap gap-2">
      <ActionDialog
        trigger={<AdminButton><Icons.check size={15} aria-hidden="true" /> Approve</AdminButton>}
        title="Approve verification permanently?"
        description={`${name} will be marked as verified. This decision cannot later be changed to rejected.`}
        confirmLabel="Approve verification"
        onConfirm={(reason) => void commitDecision(kind, id, "Approved", "Verified", `${id} approved`, "success", reason)}
      />
      <ActionDialog
        trigger={<AdminButton variant="danger"><Icons.x size={15} aria-hidden="true" /> Reject</AdminButton>}
        title="Reject verification permanently?"
        description="A rejection reason is required. This decision cannot later be changed to approved."
        confirmLabel="Reject verification"
        tone="danger"
        requireReason
        onConfirm={(reason) => void commitDecision(kind, id, "Rejected", "Rejected", `${id} rejected`, "danger", reason)}
      />
    </div>;
  }

  if (kind === "report") {
    const finalAction = storedDecision?.action ?? (currentStatus === "Resolved" ? "Resolved" : currentStatus === "Dismissed" ? "Dismissed" : null);
    if (finalAction) return <FinalDecision action={finalAction} />;

    return <div className="flex flex-wrap gap-2">
      <ActionDialog
        trigger={<AdminButton>Resolve report</AdminButton>}
        title="Resolve report permanently?"
        description="Mark this investigation as resolved. Once resolved, it cannot later be dismissed."
        confirmLabel="Resolve report"
        requireReason
        onConfirm={(reason) => void commitDecision(kind, id, "Resolved", "Resolved", `${id} resolved`, "success", reason)}
      />
      <ActionDialog
        trigger={<AdminButton variant="outline">Dismiss</AdminButton>}
        title="Dismiss report permanently?"
        description="Dismiss this report without enforcement. Once dismissed, it cannot later be resolved instead."
        confirmLabel="Dismiss report"
        requireReason
        onConfirm={(reason) => void commitDecision(kind, id, "Dismissed", "Dismissed", `${id} dismissed`, "info", reason)}
      />
    </div>;
  }

  if (kind === "listing") {
    const finalAction = storedDecision?.action ?? (currentStatus === "Rejected" ? "Rejected" : currentStatus === "Removed" ? "Removed" : currentStatus === "Active" && status && status !== "Active" ? "Approved" : null);
    if (finalAction) {
      return <div className="flex flex-wrap gap-2">
        {finalAction === "Approved" && <PublicListingLink title={name} slug={publicSlug} />}
        <FinalDecision action={finalAction} />
      </div>;
    }

    return <div className="flex flex-wrap gap-2">
      <PublicListingLink title={name} slug={publicSlug} />
      <ActionDialog
        trigger={<AdminButton variant="danger">Remove listing</AdminButton>}
        title="Remove listing permanently?"
        description={`${name} will no longer be available in the marketplace. This enforcement decision cannot be reversed from the admin console.`}
        confirmLabel="Remove listing"
        tone="danger"
        requireReason
        onConfirm={(reason) => void commitDecision(kind, id, "Removed", "Removed", `${id} removed`, "danger", reason)}
      />
    </div>;
  }

  if (kind === "seller") {
    if (currentStatus === "Suspended") {
      return <ActionDialog
        trigger={<AdminButton variant="outline">Restore selling access</AdminButton>}
        title="Restore selling access?"
        description={`${name} will regain permission to publish and manage marketplace listings.`}
        confirmLabel="Restore selling access"
        requireReason
        onConfirm={(reason) => void setStatus(kind, id, "Verified", `${id} selling access restored`, reason)}
      />;
    }

    return <ActionDialog
      trigger={<AdminButton variant="danger">Suspend selling access</AdminButton>}
      title="Suspend selling access?"
      description={`${name} will be unable to publish or manage marketplace listings until access is restored. Their profile data will not be edited.`}
      confirmLabel="Suspend selling access"
      tone="danger"
      requireReason
      onConfirm={(reason) => void setStatus(kind, id, "Suspended", `${id} suspended`, reason)}
    />;
  }

  if (currentStatus === "Suspended") {
    return <ActionDialog
      trigger={<AdminButton variant="outline">Reactivate account</AdminButton>}
      title="Reactivate account?"
      description={`${name} will regain account access.`}
      confirmLabel="Reactivate account"
      requireReason
      onConfirm={(reason) => void setStatus(kind, id, "Active", `${id} reactivated`, reason)}
    />;
  }

  return <ActionDialog
    trigger={<AdminButton variant="danger">Suspend account</AdminButton>}
    title="Suspend account?"
    description={`${name} will lose account access until reactivated. Their profile data will remain unchanged.`}
    confirmLabel="Suspend account"
    tone="danger"
    requireReason
    onConfirm={(reason) => void setStatus(kind, id, "Suspended", `${id} suspended`, reason)}
  />;
}

export function MoveListingToReviewAction({ id, status }: { id: string; status: string }) {
  const { getStatus, getDecision, setStatus } = useAdminData();
  const currentStatus = getStatus("listing", id, status);
  const decision = getDecision("listing", id);

  const migratedApproval = !decision && currentStatus === "Active" && status !== "Active";

  if (decision || migratedApproval || currentStatus === "Rejected" || currentStatus === "Removed") {
    return <FinalDecision action={decision?.action ?? (migratedApproval ? "Approved" : currentStatus)} />;
  }

  if (currentStatus === "Review" || currentStatus === "Pending") {
    return <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-800">Already in moderation review</div>;
  }

  return <ActionDialog
    trigger={<button type="button" className="rounded-lg border border-slate-300 px-3 py-2.5 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Move to review</button>}
    title="Move listing to moderation review?"
    description="This is an operational queue change, not a final moderation decision."
    confirmLabel="Move to review"
    requireReason
    onConfirm={(reason) => void setStatus("listing", id, "Review", `${id} moved to review`, reason)}
  />;
}
