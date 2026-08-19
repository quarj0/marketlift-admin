import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DateRangeControl } from "@/components/ui/date-range-control";
import { categories, listings, payments, promotionProducts, reports, sellers, users } from "@/data/mock-data";

function Line({ color, dash = false }: { color: string; dash?: boolean }) {
  return <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="absolute inset-x-0 bottom-6 h-[190px] w-full" aria-hidden="true"><polyline points="0,132 50,118 100,122 150,95 200,106 250,76 300,82 350,57 400,68 450,38 500,52 550,24 600,31" fill="none" stroke={color} strokeWidth="3" strokeDasharray={dash ? "6 6" : undefined} vectorEffect="non-scaling-stroke" /></svg>;
}

export default function AnalyticsPage() {
  const categoryRows = [...categories].sort((a, b) => b.listings - a.listings).slice(0, 5);
  const totalListings = Math.max(listings.length, 1);
  const activeSellers = sellers.filter((seller) => seller.status !== "Suspended").length;
  const openReports = reports.filter((report) => !(["Resolved", "Dismissed"] as string[]).includes(report.status)).length;
  const paidPayments = payments.filter((payment) => payment.status === "Paid").length;
  const paymentSuccess = payments.length ? Math.round((paidPayments / payments.length) * 100) : 100;
  const reportRate = ((openReports / totalListings) * 100).toFixed(1);

  const revenueRows = [
    ["Seller subscriptions", payments.filter((payment) => /subscription/i.test(payment.type)).length],
    ...promotionProducts.slice(0, 3).map((product) => [product.name, payments.filter((payment) => payment.type.includes(product.name)).length] as [string, number]),
  ] as [string, number][];
  const maxRevenueCount = Math.max(...revenueRows.map(([, count]) => count), 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Marketplace growth, inventory and seller activity using the current shared catalog." actions={<DateRangeControl />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Users" value={users.length.toLocaleString("pt-BR")} change="Current" meta="Administration preview" />
        <KpiCard label="Listings" value={listings.length.toLocaleString("pt-BR")} change={`${listings.filter((item) => item.status === "Active").length} active`} meta="Marketplace catalog" />
        <KpiCard label="Active sellers" value={activeSellers.toLocaleString("pt-BR")} change={`${sellers.length} total`} meta="Marketplace sellers" />
        <KpiCard label="Payment success" value={`${paymentSuccess}%`} change={`${payments.length} records`} meta="Seller billing activity" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex justify-between"><div><h2 className="text-sm font-black">Marketplace activity</h2><p className="mt-0.5 text-xs text-slate-500">Illustrative activity trend for the selected period</p></div><span className="text-xs font-black text-emerald-700">Current period</span></div>
          <div className="relative mt-4 h-64 overflow-hidden rounded-lg bg-[linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:100%_25%]"><Line color="#059669" /><Line color="#94a3b8" dash /></div>
          <div className="flex gap-5 text-[11px] text-slate-500"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-emerald-600" />Listings</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-slate-400" />Sellers</span></div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black">Billing activity by product</h2><p className="mt-0.5 text-xs text-slate-500">Current mock payment records mapped to marketplace products</p>
          <div className="mt-7 space-y-6">
            {revenueRows.map(([label, count]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">{label}</span><strong>{count}</strong></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.round((count / maxRevenueCount) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black">Top categories</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {categoryRows.map((category, index) => (
              <div key={category.slug} className="flex items-center gap-3 py-3">
                <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">{index + 1}</span>
                <span className="flex-1 text-xs font-bold text-slate-700">{category.name}</span>
                <span className="text-xs text-slate-500">{category.listings.toLocaleString("pt-BR")}</span>
                <strong className="w-12 text-right text-xs">{((category.listings / totalListings) * 100).toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black">Marketplace health</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              ["Open report rate", `${reportRate}%`],
              ["Active listings", `${Math.round((listings.filter((item) => item.status === "Active").length / totalListings) * 100)}%`],
              ["Active sellers", `${sellers.length ? Math.round((activeSellers / sellers.length) * 100) : 100}%`],
              ["Payment success", `${paymentSuccess}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><strong className="mt-2 block text-lg font-black">{value}</strong><span className="mt-1 block text-[10px] font-bold text-emerald-600">● Current</span></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
