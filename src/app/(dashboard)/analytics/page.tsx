import { PageHeader } from "@/components/ui/page-header";
import { DateRangeControl } from "@/components/ui/date-range-control";
import { KpiCard } from "@/components/ui/kpi-card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Marketplace growth, selling adoption, inventory, trust and Marketlift service revenue."
        actions={<DateRangeControl />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Monthly active users" value="18,932" change="+9.8%" meta="76.2% of total users" />
        <KpiCard label="New listings" value="5,841" change="+14.1%" meta="194 avg. per day" />
        <KpiCard label="Selling activation" value="17.2%" change="+2.3%" meta="Users with selling enabled" />
        <KpiCard label="Avg. service revenue / seller" value="R$ 19,69" change="+4.4%" meta="Plans + promotions" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex justify-between gap-4">
            <div>
              <h2 className="text-sm font-black">User growth</h2>
              <p className="mt-0.5 text-xs text-slate-500">New vs active accounts</p>
            </div>
            <span className="text-xs font-black text-blue-700">+8.4%</span>
          </div>
          <div className="relative mt-4 h-64 overflow-hidden rounded-xl bg-[linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:100%_25%]" role="img" aria-label="User growth trend chart">
            <Line color="#0b63f6" />
            <Line color="#94a3b8" dash />
          </div>
          <div className="flex gap-5 text-[11px] text-slate-500">
            <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#0b63f6]" />Active</span>
            <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-slate-400" />New</span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black">Service revenue by product</h2>
          <p className="mt-0.5 text-xs text-slate-500">Current month contribution; excludes buyer-to-seller transactions</p>
          <div className="mt-7 space-y-6">
            {[
              ["Selling plan subscriptions", "R$ 71,4k", 85],
              ["Featured", "R$ 5,1k", 6],
              ["Top of Search", "R$ 3,2k", 4],
              ["Urgent + Homepage Featured", "R$ 4,6k", 5],
            ].map(([label, value, width]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                  <span className="font-semibold text-slate-600">{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-[#ff8a00]" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black">Top categories</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {[
              ["Vehicles", 3820, "20.7%"],
              ["Mobile Phones", 3211, "17.4%"],
              ["Electronics", 2840, "15.4%"],
              ["Home & Garden", 2351, "12.8%"],
              ["Fashion", 2198, "11.9%"],
            ].map(([name, count, share], index) => (
              <div key={String(name)} className="flex items-center gap-3 py-3">
                <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">{index + 1}</span>
                <span className="flex-1 text-xs font-bold text-slate-700">{name}</span>
                <span className="text-xs text-slate-500">{Number(count).toLocaleString("pt-BR")}</span>
                <strong className="w-12 text-right text-xs">{share}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black">Marketplace health</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              ["Report rate", "0.17%", "Good"],
              ["Auto-publish rate", "96.8%", "Healthy"],
              ["Seller response", "91.4%", "Good"],
              ["Service payment success", "97.4%", "Good"],
            ].map(([label, value, status]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                <strong className="mt-2 block text-lg font-black">{value}</strong>
                <span className="mt-1 block text-[10px] font-bold text-emerald-600">● {status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Line({ color, dash = false }: { color: string; dash?: boolean }) {
  return (
    <svg viewBox="0 0 600 240" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
      <path
        d="M0 190 C65 175 90 182 145 150 C210 118 245 140 305 102 C365 65 400 96 455 58 C510 31 548 49 600 24"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={dash ? "7 7" : undefined}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
