import type { SelectHTMLAttributes } from "react";

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`min-h-11 rounded-xl border border-slate-200 bg-white px-3 pr-9 text-xs font-bold text-slate-600 outline-none transition hover:border-slate-300 focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10 ${props.className ?? ""}`}
    />
  );
}
