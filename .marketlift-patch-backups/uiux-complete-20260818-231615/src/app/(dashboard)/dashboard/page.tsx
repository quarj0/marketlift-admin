import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { attentionItems, dashboardStats, listings, activityLog } from "@/data/mock-data";
import { Icons } from "@/lib/icons";

function ActivityChart() {
  const points = "0,106 45,96 90,99 135,76 180,82 225,55 270,62 315,44 360,51 405,30 450,38 495,19 540,27 585,12";
  const points2 = "0,124 45,119 90,114 135,108 180,111 225,95 270,101 315,89 360,92 405,77 450,81 495,68 540,72 585,58";
  return <div className="relative mt-4 h-[230px] w-full overflow-hidden">
    <div className="absolute inset-0 flex flex-col justify-between pb-7 text-[10px] text-slate-400">{["20k","15k","10k","5k","0"].map((x)=><div key={x} className="flex items-center gap-2"><span className="w-7">{x}</span><span className="h-px flex-1 bg-slate-100"/></div>)}</div>
    <svg viewBox="0 0 585 150" preserveAspectRatio="none" className="absolute bottom-7 left-9 h-[175px] w-[calc(100%-42px)] overflow-visible">
      <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity=".16"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs>
      <polyline points={`${points} 585,150 0,150`} fill="url(#area)" stroke="none"/>
      <polyline points={points2} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" vectorEffect="non-scaling-stroke"/>
      <polyline points={points} fill="none" stroke="#059669" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
    </svg>
    <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-slate-400"><span>Aug 12</span><span>Aug 13</span><span>Aug 14</span><span>Aug 15</span><span>Aug 16</span><span>Aug 17</span><span>Aug 18</span></div>
  </div>;
}

export default function DashboardPage() {
  return <div className="space-y-6">
    <PageHeader title="Good evening, Ana" description="Here’s what’s happening on Marketlift today." actions={<button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600"><Icons.calendar size={16}/> Aug 12 – Aug 18 <Icons.arrowDown size={13}/></button>}/>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{dashboardStats.map((stat)=><KpiCard key={stat.label} {...stat} trend="up"/>)}</section>

    <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.03)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-black text-slate-900">Action required</h2><p className="mt-0.5 text-xs text-slate-500">Queues that need administrator attention</p></div><span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-600">100 total</span></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3">{attentionItems.map((item, i)=><Link key={item.label} href={item.href} className={`flex items-center gap-3 p-4 transition hover:bg-slate-50 ${i < 3 ? "xl:border-b" : ""} ${i % 3 !== 2 ? "xl:border-r" : ""} border-slate-100`}><span className={`grid size-9 place-items-center rounded-lg ${item.tone === "red" ? "bg-red-50 text-red-600" : item.tone === "blue" ? "bg-blue-50 text-blue-600" : item.tone === "orange" ? "bg-orange-50 text-orange-600" : "bg-amber-50 text-amber-600"}`}><Icons.alert size={17}/></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{item.label}</span><span className="text-[11px] text-slate-400">Review queue</span></span><strong className="text-base font-black text-slate-950">{item.count}</strong><Icons.chevronRight size={15} className="text-slate-300"/></Link>)}</div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.65fr_.85fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-black text-slate-900">Marketplace activity</h2><p className="mt-0.5 text-xs text-slate-500">Listings created vs. new users</p></div><div className="flex rounded-lg bg-slate-100 p-1 text-[10px] font-bold text-slate-500"><button className="rounded-md bg-white px-2.5 py-1.5 text-slate-800 shadow-sm">7 days</button><button className="px-2.5 py-1.5">30 days</button><button className="px-2.5 py-1.5">90 days</button></div></div><ActivityChart/><div className="mt-2 flex items-center gap-5 text-[11px] font-semibold text-slate-500"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-600"/>Listings</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-slate-400"/>Users</span></div></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black text-slate-900">Listing status</h2><p className="mt-0.5 text-xs text-slate-500">Current marketplace inventory</p><div className="mt-6 space-y-5">{[
        ["Active",18420,78,"bg-emerald-500"],["Under review",91,9,"bg-blue-500"],["Rejected",43,6,"bg-red-500"],["Expired",3821,16,"bg-slate-400"],["Suspended",17,3,"bg-orange-500"]
      ].map(([label,count,width,color])=><div key={String(label)}><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-slate-600">{label}</span><strong className="text-slate-900">{Number(count).toLocaleString("pt-BR")}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{width:`${width}%`}}/></div></div>)}</div></div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between px-5 py-4"><div><h2 className="text-sm font-black text-slate-900">Recent listings</h2><p className="mt-0.5 text-xs text-slate-500">Newest marketplace submissions</p></div><Link href="/listings" className="text-xs font-black text-emerald-700">View all</Link></div><div className="table-scroll"><table className="admin-table"><thead><tr><th>Listing</th><th>Seller</th><th>Price</th><th>Status</th><th/></tr></thead><tbody>{listings.slice(0,5).map((item)=><tr key={item.id}><td><div className="font-bold text-slate-900">{item.title}</div><div className="mt-0.5 text-[10px] text-slate-400">{item.id} · {item.category}</div></td><td>{item.seller}</td><td className="font-semibold text-slate-700">{item.price}</td><td><StatusBadge status={item.status}/></td><td><Link href={`/listings/${item.id}`} className="text-xs font-bold text-emerald-700">View</Link></td></tr>)}</tbody></table></div></div>
      <div className="rounded-xl border border-slate-200 bg-white"><div className="px-5 py-4"><h2 className="text-sm font-black text-slate-900">Recent admin activity</h2><p className="mt-0.5 text-xs text-slate-500">Latest operational actions</p></div><div className="px-5 pb-3">{activityLog.slice(0,5).map((item,i)=><div key={i} className="relative flex gap-3 pb-5 last:pb-2"><div className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"><Icons.activity size={14}/></div>{i<4 && <div className="absolute left-[15px] top-8 h-[calc(100%-22px)] w-px bg-slate-100"/>}<div className="min-w-0 pt-0.5"><p className="text-xs leading-5 text-slate-600"><strong className="text-slate-800">{item.admin}</strong> {item.action.toLowerCase()}</p><p className="truncate text-[10px] text-slate-400">{item.target}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.time}</p></div></div>)}</div></div>
    </section>
  </div>;
}
