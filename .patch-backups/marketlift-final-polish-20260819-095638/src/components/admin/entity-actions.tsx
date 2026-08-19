"use client";
import { AdminButton } from "@/components/ui/admin-button";
import { ActionDialog } from "@/components/ui/action-dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "./admin-demo-provider";

export function EntityActions({ kind, id, name }: { kind: "user" | "seller" | "listing" | "report" | "verification"; id: string; name: string }) {
  const { setStatus, toast } = useAdminDemo();

  if (kind === "verification") return <div className="flex flex-wrap gap-2">
    <ActionDialog trigger={<AdminButton><Icons.check size={15} aria-hidden="true"/> Approve</AdminButton>} title="Approve verification?" description={`${name} will be marked as verified.`} confirmLabel="Approve verification" onConfirm={() => setStatus(kind, id, "Verified", `${id} approved`)}/>
    <ActionDialog trigger={<AdminButton variant="danger"><Icons.x size={15} aria-hidden="true"/> Reject</AdminButton>} title="Reject verification?" description="A rejection reason is required for auditability." confirmLabel="Reject verification" tone="danger" requireReason onConfirm={() => setStatus(kind, id, "Rejected", `${id} rejected`)}/>
  </div>;

  if (kind === "report") return <div className="flex flex-wrap gap-2">
    <ActionDialog trigger={<AdminButton>Resolve report</AdminButton>} title="Resolve report?" description="Mark this investigation as complete." confirmLabel="Resolve report" requireReason onConfirm={() => setStatus(kind, id, "Resolved", `${id} resolved`)}/>
    <ActionDialog trigger={<AdminButton variant="outline">Dismiss</AdminButton>} title="Dismiss report?" description="Dismiss this report without enforcement." confirmLabel="Dismiss report" requireReason onConfirm={() => setStatus(kind, id, "Resolved", `${id} dismissed`)}/>
  </div>;

  if (kind === "listing") return <div className="flex flex-wrap gap-2">
    <AdminButton variant="outline" onClick={() => toast("Public listing opened", `${id} opened in the public-view flow.`, "info")}><Icons.external size={15} aria-hidden="true"/> View public</AdminButton>
    <ActionDialog trigger={<AdminButton variant="danger">Remove listing</AdminButton>} title="Remove listing?" description={`${name} will no longer be available in the marketplace.`} confirmLabel="Remove listing" tone="danger" requireReason onConfirm={() => setStatus(kind, id, "Rejected", `${id} removed`)}/>
  </div>;

  if (kind === "seller") return <ActionDialog
    trigger={<AdminButton variant="danger">Suspend selling access</AdminButton>}
    title="Suspend selling access?"
    description={`${name} will be unable to publish or manage marketplace listings until access is restored. Their profile data will not be edited.`}
    confirmLabel="Suspend selling access"
    tone="danger"
    requireReason
    onConfirm={() => setStatus(kind, id, "Suspended", `${id} suspended`)}
  />;

  return <ActionDialog
    trigger={<AdminButton variant="danger">Suspend account</AdminButton>}
    title="Suspend account?"
    description={`${name} will lose account access until reactivated. Their profile data will remain unchanged.`}
    confirmLabel="Suspend account"
    tone="danger"
    requireReason
    onConfirm={() => setStatus(kind, id, "Suspended", `${id} suspended`)}
  />;
}

export function MockAction({ label, message, tone = "info" }: { label: string; message: string; tone?: "success" | "danger" | "info" }) {
  const { toast } = useAdminDemo();
  return <button type="button" onClick={() => toast(label, message, tone)} className="rounded-lg border border-slate-300 px-3 py-2.5 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-50">{label}</button>;
}
