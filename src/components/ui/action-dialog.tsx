"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Dialog } from "./dialog";
import { AdminButton } from "./admin-button";

type DialogTriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  "aria-haspopup"?: "dialog";
  "aria-expanded"?: boolean;
};

export function ActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  tone = "primary",
  requireReason = false,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  requireReason?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<DialogTriggerProps>, {
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        onClick: (event: MouseEvent<HTMLElement>) => {
          const original = (trigger as ReactElement<DialogTriggerProps>).props.onClick;
          original?.(event);
          if (!event.defaultPrevented) setOpen(true);
        },
      })
    : (
        <AdminButton
          variant="outline"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          {trigger}
        </AdminButton>
      );

  return (
    <>
      {triggerElement}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant={tone === "danger" ? "danger" : "primary"}
              disabled={requireReason && reason.trim().length < 5}
              onClick={() => {
                onConfirm(reason.trim());
                setOpen(false);
                setReason("");
              }}
            >
              {confirmLabel}
            </AdminButton>
          </>
        }
      >
        {requireReason && (
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-700">
              Internal reason <span className="text-red-500">*</span>
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              autoFocus
              className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              placeholder="Explain why this action is being taken..."
            />
            <span className="mt-1 block text-[10px] leading-4 text-slate-400">
              Minimum 5 characters. This note is kept with the audit event.
            </span>
          </label>
        )}
      </Dialog>
    </>
  );
}
