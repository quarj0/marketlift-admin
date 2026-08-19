import type { ReactNode } from "react";
import { Icons } from "@/lib/icons";

export function TableTools({ placeholder = "Search...", children }: { placeholder?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <span className="sr-only">Search table</span>
        <Icons.search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
          placeholder={placeholder}
        />
      </label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
