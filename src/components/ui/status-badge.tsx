import type { Status } from "@/types/admin";

const tones: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Resolved: "bg-slate-100 text-slate-700 ring-slate-500/20",
  Dismissed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Removed: "bg-red-50 text-red-800 ring-red-700/20",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Review: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Suspended: "bg-red-50 text-red-700 ring-red-600/20",
  Rejected: "bg-red-50 text-red-700 ring-red-600/20",
  Failed: "bg-red-50 text-red-700 ring-red-600/20",
  Refunded: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Open: "bg-orange-50 text-orange-700 ring-orange-600/20",
  Expired: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Draft: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function StatusBadge({ status }: { status: Status | string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${tones[status] ?? tones.Resolved}`}>{status}</span>;
}
