export function PageSkeleton() {
  return <div className="animate-pulse space-y-6"><div className="h-8 w-52 rounded-lg bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-28 rounded-xl bg-slate-200/70"/>)}</div><div className="h-[420px] rounded-xl bg-slate-200/70"/></div>;
}
