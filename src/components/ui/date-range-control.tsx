"use client";

import { useState } from "react";
import { Icons } from "@/lib/icons";

export function DateRangeControl({ compact = false }: { compact?: boolean }) {
  const [range, setRange] = useState("Last 7 days");

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Analytics date range</span>
      <Icons.calendar size={15} className="pointer-events-none absolute left-3 text-slate-400" />
      <select
        value={range}
        onChange={(event) => setRange(event.target.value)}
        className={`min-h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs font-bold text-slate-600 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10 ${compact ? "max-w-[190px]" : ""}`}
      >
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
        <option>This year</option>
      </select>
      <Icons.arrowDown size={12} className="pointer-events-none absolute right-3 text-slate-400" />
    </label>
  );
}
