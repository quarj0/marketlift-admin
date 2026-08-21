"use client";
import { SafeLink } from "@/components/ui/safe-link";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { Icons } from "@/lib/icons";
import { DashboardActivityCard } from "@/components/admin/dashboard-activity-card";
import { MarketplaceImage } from "@/components/admin/marketplace-image";

export default function DashboardPage() {
  const { activityLog, listings, payments, reports, sellers, supportTickets, users, verifications, sessionUser } = useAdminData();
  const activeListings = listings.filter((listing) => listing.status === "Active").length;
  const listingStatus = [
    ["Active", listings.filter((listing) => listing.status === "Active").length, "bg-emerald-500"],
    ["Under review", listings.filter((listing) => ["Pending", "Review"].includes(listing.status)).length, "bg-blue-500"],
    ["Rejected", listings.filter((listing) => listing.status === "Rejected").length, "bg-red-500"],
    ["Reported", listings.filter((listing) => listing.reports > 0).length, "bg-orange-500"],
  ] as const;
  const listingTotal = Math.max(listings.length, 1);

  const stats = [
    { label: "Total users", value: users.length.toLocaleString("pt-BR"), change: "Current", trend: "up" as const, meta: "Registered accounts" },
    { label: "Sellers", value: sellers.length.toLocaleString("pt-BR"), change: "Current", trend: "up" as const, meta: "Seller accounts" },
    { label: "Active listings", value: activeListings.toLocaleString("pt-BR"), change: `${listings.length} total`, trend: "up" as const, meta: "Marketplace listings" },
    { label: "Recorded payments", value: payments.length.toLocaleString("pt-BR"), change: "Seller billing", trend: "up" as const, meta: "Subscription and promotion activity" },
  ];

  const attention = [
    { label: "Verification requests", count: verifications.filter((item) => ["Pending", "Review"].includes(item.status)).length, href: "/verifications", tone: "amber" },
    { label: "Flagged listings", count: listings.filter((item) => item.reports > 0 || item.status === "Review").length, href: "/moderation", tone: "red" },
    { label: "Open reports", count: reports.filter((item) => !(["Resolved", "Dismissed"] as string[]).includes(item.status)).length, href: "/reports", tone: "orange" },
    { label: "Payment issues", count: payments.filter((item) => item.status === "Failed").length, href: "/payments", tone: "red" },
    { label: "Support tickets", count: supportTickets.filter((item) => item.status !== "Resolved").length, href: "/support", tone: "blue" },
    { label: "Listings under review", count: listings.filter((item) => ["Pending", "Review"].includes(item.status)).length, href: "/listings", tone: "amber" },
  ];
  const attentionTotal = attention.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${sessionUser?.name?.split(" ")[0] || "Admin"}`} description="Here’s what’s happening on Marketlift today." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <KpiCard key={stat.label} {...stat} />)}</section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.03)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="text-sm font-black text-slate-900">Action required</h2><p className="mt-0.5 text-xs text-slate-500">Queues that need administrator attention</p></div>
          <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-600">{attentionTotal} total</span>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3">
          {attention.map((item, index) => (
            <SafeLink key={item.label} href={item.href} className={`flex items-center gap-3 p-4 transition hover:bg-slate-50 ${index < 3 ? "xl:border-b" : ""} ${index % 3 !== 2 ? "xl:border-r" : ""} border-slate-100`}>
              <span className={`grid size-9 place-items-center rounded-lg ${item.tone === "red" ? "bg-red-50 text-red-600" : item.tone === "blue" ? "bg-blue-50 text-blue-600" : item.tone === "orange" ? "bg-orange-50 text-orange-600" : "bg-amber-50 text-amber-600"}`}><Icons.alert size={17} /></span>
              <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{item.label}</span><span className="text-[11px] text-slate-400">Review queue</span></span>
              <strong className="text-base font-black text-slate-950">{item.count}</strong><Icons.chevronRight size={15} className="text-slate-300" />
            </SafeLink>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_.85fr]">
        <DashboardActivityCard />
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black text-slate-900">Listing status</h2><p className="mt-0.5 text-xs text-slate-500">Current marketplace catalog</p>
          <div className="mt-6 space-y-5">
            {listingStatus.map(([label, count, color]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-slate-600">{label}</span><strong className="text-slate-900">{count.toLocaleString("pt-BR")}</strong></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(count ? 6 : 0, Math.round((count / listingTotal) * 100))}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4"><div><h2 className="text-sm font-black text-slate-900">Recent listings</h2><p className="mt-0.5 text-xs text-slate-500">Marketplace catalog items</p></div><SafeLink href="/listings" className="text-xs font-black text-emerald-700">View all</SafeLink></div>
          <div className="table-scroll">
            <table className="admin-table" aria-label="Recent marketplace listings">
              <thead><tr><th scope="col">Listing</th><th scope="col">Seller</th><th scope="col">Price</th><th scope="col">Status</th><th scope="col" /></tr></thead>
              <tbody>
                {listings.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td><div className="flex items-center gap-3"><MarketplaceImage src={item.image} alt={`${item.title} thumbnail`} className="size-10 shrink-0 rounded-lg object-cover" fallbackClassName="size-10 shrink-0 rounded-lg" /><div><div className="font-bold text-slate-900">{item.title}</div><div className="mt-0.5 text-[10px] text-slate-400">{item.id} · {item.category}</div></div></div></td>
                    <td>{item.seller}</td><td className="font-semibold text-slate-700">{item.price}</td><td><StatusBadge status={item.status} /></td><td><SafeLink href={`/listings/${item.id}`} className="text-xs font-bold text-emerald-700">View</SafeLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="px-5 py-4"><h2 className="text-sm font-black text-slate-900">Recent admin activity</h2><p className="mt-0.5 text-xs text-slate-500">Latest operational actions</p></div>
          <div className="px-5 pb-3">
            {activityLog.slice(0, 5).map((item, index) => (
              <div key={`${item.admin}-${item.time}-${index}`} className="relative flex gap-3 pb-5 last:pb-2">
                <div className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"><Icons.activity size={14} /></div>
                {index < 4 && <div className="absolute left-[15px] top-8 h-[calc(100%-22px)] w-px bg-slate-100" />}
                <div className="min-w-0 pt-0.5"><p className="text-xs leading-5 text-slate-600"><strong className="text-slate-800">{item.admin}</strong> {item.action.toLowerCase()}</p><p className="truncate text-[10px] text-slate-400">{item.target}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.time}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
