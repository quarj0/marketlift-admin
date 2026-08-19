"use client";

import { usePathname } from "next/navigation";
import { MarketliftAdminLogo } from "@/components/brand/marketlift-admin-logo";
import { Icons } from "@/lib/icons";
import { SafeLink } from "@/components/ui/safe-link";

const sections = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: Icons.dashboard }] },
  {
    label: "Marketplace",
    items: [
      { label: "Users", href: "/users", icon: Icons.users },
      { label: "Selling profiles", href: "/sellers", icon: Icons.store },
      { label: "Listings", href: "/listings", icon: Icons.tag },
      { label: "Categories", href: "/categories", icon: Icons.layers },
    ],
  },
  {
    label: "Trust & Safety",
    items: [
      { label: "Moderation", href: "/moderation", icon: Icons.shield, badge: "24" },
      { label: "Verifications", href: "/verifications", icon: Icons.verify, badge: "18" },
      { label: "Reports", href: "/reports", icon: Icons.alert, badge: "31" },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Selling plans", href: "/subscriptions", icon: Icons.credit },
      { label: "Service payments", href: "/payments", icon: Icons.money },
      { label: "Promotions", href: "/promotions", icon: Icons.megaphone },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Analytics", href: "/analytics", icon: Icons.chart },
      { label: "Support", href: "/support", icon: Icons.ticket, badge: "12" },
      { label: "Activity logs", href: "/activity", icon: Icons.activity },
    ],
  },
  { label: "System", items: [{ label: "Settings", href: "/settings", icon: Icons.settings }] },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[280px] flex-col bg-[#02122f] text-slate-300">
      <div className="flex min-h-[76px] items-center border-b border-white/10 px-5">
        <MarketliftAdminLogo onNavigate={onNavigate} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none]" aria-label="Admin navigation">
        {sections.map((section) => (
          <div key={section.label} className="mb-5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <SafeLink
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                      active
                        ? "bg-[#0b63f6]/16 text-white"
                        : "text-slate-400 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[#ff8a00]" aria-hidden="true" />}
                    <Icon
                      size={18}
                      className={active ? "text-[#38bdf8]" : "text-slate-500 group-hover:text-slate-300"}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          active
                            ? "bg-[#ff8a00]/15 text-[#ffb84d]"
                            : "bg-white/8 text-slate-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </SafeLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 rounded-xl border border-white/8 bg-white/[.035] px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Environment</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300">
              <i className="size-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
              Development
            </span>
          </div>
        </div>
        <SafeLink
          href="/login"
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Icons.logout size={18} /> Sign out
        </SafeLink>
      </div>
    </aside>
  );
}
