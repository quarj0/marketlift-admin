"use client";

import { useId, useState, type ReactNode } from "react";
import { Dialog } from "./dialog";
import { AdminButton } from "./admin-button";

export function ActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  tone = "primary",
  requireReason = false,
  reasonLabel = "Internal reason",
  reasonPlaceholder = "Explain why this action is being taken…",
  reasonHelp = "This note is retained with the administrative action.",
  minReasonLength = 5,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonHelp?: string;
  minReasonLength?: number;
  onConfirm: (reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = useId();
  const helpId = useId();
  const trimmedReason = reason.trim();
  const valid = !requireReason || trimmedReason.length >= minReasonLength;

  const close = () => {
    setOpen(false);
    setReason("");
  };

  return <>
    <span className="contents" onClick={() => setOpen(true)}>{trigger}</span>
    <Dialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      footer={<>
        <AdminButton variant="outline" onClick={close}>Cancel</AdminButton>
        <AdminButton
          variant={tone === "danger" ? "danger" : "primary"}
          disabled={!valid}
          onClick={() => { onConfirm(trimmedReason); close(); }}
        >
          {confirmLabel}
        </AdminButton>
      </>}
    >
      {requireReason && <div>
        <label htmlFor={reasonId} className="mb-2 block text-xs font-bold text-slate-800">
          {reasonLabel} <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only"> required</span>
        </label>
        <textarea
          id={reasonId}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          data-dialog-autofocus
          aria-describedby={helpId}
          aria-invalid={reason.length > 0 && !valid}
          className="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder={reasonPlaceholder}
        />
        <div id={helpId} className="mt-1.5 flex items-start justify-between gap-4 text-[11px] leading-4 text-slate-500">
          <span>{reasonHelp}</span>
          <span className={valid || !reason.length ? "shrink-0" : "shrink-0 font-bold text-red-600"}>{trimmedReason.length}/{minReasonLength} min</span>
        </div>
      </div>}
    </Dialog>
  </>;
}
