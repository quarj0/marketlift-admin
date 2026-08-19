import type { ReactNode } from "react";
export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description: string }) {
  return <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center"><div>{icon && <div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500">{icon}</div>}<h3 className="font-black text-slate-900">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p></div></div>;
}
