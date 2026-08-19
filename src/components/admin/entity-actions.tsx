"use client";

import { AdminButton } from "@/components/ui/admin-button";
import { ActionDialog } from "@/components/ui/action-dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "./admin-demo-provider";

export function EntityActions({
  kind,
  id,
  name,
}: {
  kind: "user" | "seller" | "listing" | "report" | "verification";
  id: string;
  name: string;
}) {
  const { setStatus, toast } = useAdminDemo();

  if (kind === "verification") {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionDialog
          trigger={<AdminButton><Icons.check size={15} /> Approve</AdminButton>}
          title="Approve verification?"
          description={`${name} will be marked verified. Verification is a trust signal, not a transaction guarantee.`}
          confirmLabel="Approve verification"
          onConfirm={() => setStatus(kind, id, "Verified", `${id} approved`)}
        />
        <ActionDialog
          trigger={<AdminButton variant="danger"><Icons.x size={15} /> Reject</AdminButton>}
          title="Reject verification?"
          description="A rejection reason is required for auditability. The account can continue using ordinary marketplace features unless another policy applies."
          confirmLabel="Reject verification"
          tone="danger"
          requireReason
          onConfirm={() => setStatus(kind, id, "Rejected", `${id} rejected`)}
        />
      </div>
    );
  }

  if (kind === "report") {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionDialog
          trigger={<AdminButton>Resolve report</AdminButton>}
          title="Resolve report?"
          description="Mark this investigation as complete after recording the outcome."
          confirmLabel="Resolve report"
          requireReason
          onConfirm={() => setStatus(kind, id, "Resolved", `${id} resolved`)}
        />
        <ActionDialog
          trigger={<AdminButton variant="outline">Dismiss</AdminButton>}
          title="Dismiss report?"
          description="Dismiss this report without enforcement. A reason remains in the audit trail."
          confirmLabel="Dismiss report"
          requireReason
          onConfirm={() => setStatus(kind, id, "Dismissed", `${id} dismissed`)}
        />
      </div>
    );
  }

  if (kind === "listing") {
    return (
      <div className="flex flex-wrap gap-2">
        <AdminButton
          variant="outline"
          onClick={() => toast("Public preview opened", `${id} preview is represented in the mock UI.`, "info")}
        >
          <Icons.external size={15} /> View public
        </AdminButton>
        <AdminButton
          variant="outline"
          onClick={() => toast("Edit listing", `Editing ${id} is available from the listing management workflow.`, "info")}
        >
          Edit
        </AdminButton>
        <ActionDialog
          trigger={<AdminButton variant="outline"><Icons.shield size={15} /> Move to review</AdminButton>}
          title="Move listing to review?"
          description="Use manual review only when reports, risk signals or category policy justify it."
          confirmLabel="Move to review"
          requireReason
          onConfirm={() => setStatus(kind, id, "Under review", `${id} moved to review`)}
        />
        <ActionDialog
          trigger={<AdminButton variant="danger">Remove listing</AdminButton>}
          title="Remove listing?"
          description={`${name} will be removed from public marketplace inventory.`}
          confirmLabel="Remove listing"
          tone="danger"
          requireReason
          onConfirm={() => setStatus(kind, id, "Removed", `${id} removed`)}
        />
      </div>
    );
  }

  if (kind === "seller") {
    return (
      <div className="flex flex-wrap gap-2">
        <AdminButton
          variant="outline"
          onClick={() => toast("Edit selling profile", `${name} edit form is ready for backend wiring later.`, "info")}
        >
          Edit profile
        </AdminButton>
        <ActionDialog
          trigger={<AdminButton variant="danger">Suspend selling</AdminButton>}
          title="Suspend selling capability?"
          description={`${name} will lose selling access until reactivated. The underlying Marketlift user account is not automatically deleted.`}
          confirmLabel="Suspend selling"
          tone="danger"
          requireReason
          onConfirm={() => setStatus(kind, id, "Suspended", `${id} selling access suspended`)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <AdminButton
        variant="outline"
        onClick={() => toast("Edit user", `${name} edit form is ready for backend wiring later.`, "info")}
      >
        Edit user
      </AdminButton>
      <ActionDialog
        trigger={<AdminButton variant="danger">Suspend account</AdminButton>}
        title="Suspend account?"
        description={`${name} will lose account access until reactivated.`}
        confirmLabel="Suspend account"
        tone="danger"
        requireReason
        onConfirm={() => setStatus(kind, id, "Suspended", `${id} suspended`)}
      />
    </div>
  );
}

export function MockAction({
  label,
  message,
  tone = "info",
}: {
  label: string;
  message: string;
  tone?: "success" | "danger" | "info";
}) {
  const { toast } = useAdminDemo();

  return (
    <button
      type="button"
      onClick={() => toast(label, message, tone)}
      className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
    >
      {label}
    </button>
  );
}
