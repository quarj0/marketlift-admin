"use client";

import { useId, type ReactNode } from "react";
import { Icons } from "@/lib/icons";

export function TableTools({ placeholder = "Search...", children }: { placeholder?: string; children?: ReactNode }) {
  const searchId = useId();
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Icons.search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <label htmlFor={searchId} className="sr-only">Search table</label>
        <input id={searchId} type="search" className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20" placeholder={placeholder} />
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
