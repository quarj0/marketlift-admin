"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/lib/icons";

const sections = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: Icons.dashboard }] },
  { label: "Marketplace", items: [
    { label: "Users", href: "/users", icon: Icons.users },
    { label: "Sellers", href: "/sellers", icon: Icons.store },
    { label: "Listings", href: "/listings", icon: Icons.tag },
    { label: "Categories", href: "/categories", icon: Icons.layers },
  ]},
  { label: "Trust & Safety", items: [
    { label: "Moderation", href: "/moderation", icon: Icons.shield, badge: "24" },
    { label: "Verifications", href: "/verifications", icon: Icons.verify, badge: "18" },
    { label: "Reports", href: "/reports", icon: Icons.alert, badge: "31" },
  ]},
  { label: "Revenue", items: [
    { label: "Subscriptions", href: "/subscriptions", icon: Icons.credit },
    { label: "Payments", href: "/payments", icon: Icons.money },
    { label: "Promotions", href: "/promotions", icon: Icons.megaphone },
  ]},
  { label: "Operations", items: [
    { label: "Analytics", href: "/analytics", icon: Icons.chart },
    { label: "Support", href: "/support", icon: Icons.ticket, badge: "12" },
    { label: "Activity logs", href: "/activity", icon: Icons.activity },
  ]},
  { label: "System", items: [{ label: "Settings", href: "/settings", icon: Icons.settings }] },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <aside className="flex h-full w-[260px] flex-col bg-[#0d1714] text-slate-300">
    <div className="flex h-[74px] items-center border-b border-white/8 px-5">
      <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
        <div className="grid size-9 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
          <svg viewBox="0 0 32 32" className="size-6" fill="none"><path d="M7 22V10h4l5 6 5-6h4v12h-4v-6l-5 6-5-6v6H7Z" fill="currentColor"/></svg>
        </div>
        <div><div className="text-[17px] font-black tracking-tight text-white">Marketlift</div><div className="text-[9px] font-bold uppercase tracking-[.24em] text-emerald-400">Admin</div></div>
      </Link>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none]">
      {sections.map((section) => <div key={section.label} className="mb-5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.13em] text-slate-600">{section.label}</div>
        <div className="space-y-0.5">{section.items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} onClick={onNavigate} className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition ${active ? "bg-emerald-500/12 text-emerald-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
            <Icon size={18} className={active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}/><span className="flex-1">{item.label}</span>{item.badge && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? "bg-emerald-400/15 text-emerald-300" : "bg-white/7 text-slate-500"}`}>{item.badge}</span>}
          </Link>;
        })}</div>
      </div>)}
    </nav>
    <div className="border-t border-white/8 p-3"><button className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-white/5 hover:text-slate-300"><Icons.logout size={18}/> Sign out</button></div>
  </aside>;
}
