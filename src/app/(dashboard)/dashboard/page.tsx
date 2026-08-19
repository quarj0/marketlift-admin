import { SafeLink } from "@/components/ui/safe-link";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { attentionItems, dashboardStats, listings, activityLog } from "@/data/mock-data";
import { Icons } from "@/lib/icons";
import { DashboardActivityCard } from "@/components/admin/dashboard-activity-card";
import { DateRangeControl } from "@/components/ui/date-range-control";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Good evening, Ana"
        description="Marketplace health, trust queues and Marketlift service revenue at a glance."
        actions={<DateRangeControl />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Marketplace metrics">
        {dashboardStats.map((stat) => <KpiCard key={stat.label} {...stat} trend="up" />)}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(2,18,47,.03)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-black text-slate-900">Action required</h2>
            <p className="mt-0.5 text-xs text-slate-500">Queues that need administrator attention</p>
          </div>
          <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-600">
            {attentionItems.reduce((sum, item) => sum + item.count, 0)} total
          </span>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3">
          {attentionItems.map((item, index) => (
            <SafeLink
              key={item.label}
              href={item.href}
              className={`flex min-h-20 items-center gap-3 p-4 transition hover:bg-slate-50 focus-visible:bg-slate-50 ${
                index < 3 ? "xl:border-b" : ""
              } ${index % 3 !== 2 ? "xl:border-r" : ""} border-slate-100`}
            >
              <span
                className={`grid size-10 place-items-center rounded-xl ${
                  item.tone === "red"
                    ? "bg-red-50 text-red-600"
                    : item.tone === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : item.tone === "orange"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-amber-50 text-amber-600"
                }`}
              >
                <Icons.alert size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800">{item.label}</span>
                <span className="text-[11px] text-slate-400">Needs administrator attention</span>
              </span>
              <strong className="text-base font-black text-slate-950">{item.count}</strong>
              <Icons.chevronRight size={15} className="text-slate-300" />
            </SafeLink>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_.85fr]">
        <DashboardActivityCard />
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black text-slate-900">Listing lifecycle</h2>
          <p className="mt-0.5 text-xs text-slate-500">Current marketplace inventory</p>
          <div className="mt-6 space-y-5">
            {[
              ["Published", 18420, 78, "bg-[#0b63f6]"],
              ["Under review", 91, 9, "bg-amber-500"],
              ["Rejected", 43, 6, "bg-red-500"],
              ["Expired", 3821, 16, "bg-slate-400"],
              ["Paused", 317, 5, "bg-violet-500"],
            ].map(([label, count, width, color]) => (
              <div key={String(label)}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">{label}</span>
                  <strong className="text-slate-900">{Number(count).toLocaleString("pt-BR")}</strong>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">Recent listings</h2>
              <p className="mt-0.5 text-xs text-slate-500">Newest marketplace submissions and status changes</p>
            </div>
            <SafeLink href="/listings" className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-black text-[#0b63f6] transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
              View all
            </SafeLink>
          </div>
          <div className="table-scroll" role="region" aria-label="Recent listings" tabIndex={0}>
            <table className="admin-table">
              <thead><tr><th scope="col">Listing</th><th scope="col">Selling profile</th><th scope="col">Price</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {listings.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">{item.id} · {item.category}</div>
                    </td>
                    <td>{item.seller}</td>
                    <td className="font-semibold text-slate-700">{item.price}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <SafeLink href={`/listings/${item.id}`} className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-bold text-[#0b63f6] transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                        View
                      </SafeLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="px-5 py-4">
            <h2 className="text-sm font-black text-slate-900">Recent admin activity</h2>
            <p className="mt-0.5 text-xs text-slate-500">Latest operational actions</p>
          </div>
          <div className="px-5 pb-3">
            {activityLog.slice(0, 5).map((item, index) => (
              <div key={`${item.target}-${item.time}`} className="relative flex gap-3 pb-5 last:pb-2">
                <div className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                  <Icons.activity size={14} />
                </div>
                {index < 4 && <div className="absolute left-[15px] top-8 h-[calc(100%-22px)] w-px bg-slate-100" />}
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs leading-5 text-slate-600">
                    <strong className="text-slate-800">{item.admin}</strong> {item.action.toLowerCase()}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">{item.target}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
