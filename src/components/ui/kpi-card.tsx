import { Icons } from "@/lib/icons";

export function KpiCard({ label, value, change, trend = "up", meta }: { label: string; value: string; change?: string; trend?: "up" | "down"; meta?: string }) {
  const TrendIcon = trend === "up" ? Icons.arrowUp : Icons.arrowDown;
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]"><p className="text-sm font-semibold text-slate-500">{label}</p><div className="mt-2 flex items-end justify-between gap-3"><strong className="text-2xl font-black tracking-tight text-slate-950">{value}</strong>{change && <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}><TrendIcon size={13}/>{change}</span>}</div>{meta && <p className="mt-2 text-[11px] text-slate-400">{meta}</p>}</div>;
}
