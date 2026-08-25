"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { Icons } from "@/lib/icons";
import { SafeLink } from "@/components/ui/safe-link";
import { apiRequest } from "@/lib/api-client";
import { useAdminData } from "@/components/admin/admin-data-provider";
import type { AdminArea } from "@/lib/admin-access";
import type { DashboardCounts } from "@/types/admin";

type Item = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  area: AdminArea;
  badge?: (counts: DashboardCounts) => number;
};
const sections: { label: string; items: Item[] }[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Icons.dashboard,
        area: "dashboard",
      },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { label: "Users", href: "/users", icon: Icons.users, area: "users" },
      {
        label: "Sellers",
        href: "/sellers",
        icon: Icons.store,
        area: "sellers",
      },
      {
        label: "Listings",
        href: "/listings",
        icon: Icons.tag,
        area: "listings",
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Icons.layers,
        area: "categories",
      },
    ],
  },
  {
    label: "Trust & Safety",
    items: [
      {
        label: "Moderation",
        href: "/moderation",
        icon: Icons.shield,
        area: "moderation",
        badge: (c) => c.listingsUnderReview,
      },
      {
        label: "Verifications",
        href: "/verifications",
        icon: Icons.verify,
        area: "verifications",
        badge: (c) => c.pendingVerifications,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: Icons.alert,
        area: "reports",
        badge: (c) => c.openReports,
      },
    ],
  },
  {
    label: "Revenue",
    items: [
      {
        label: "Subscriptions",
        href: "/subscriptions",
        icon: Icons.credit,
        area: "subscriptions",
      },
      {
        label: "Payments",
        href: "/payments",
        icon: Icons.money,
        area: "payments",
        badge: (c) => c.failedPayments,
      },
      {
        label: "Promotions",
        href: "/promotions",
        icon: Icons.megaphone,
        area: "promotions",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: Icons.chart,
        area: "analytics",
      },
      {
        label: "Support",
        href: "/support",
        icon: Icons.ticket,
        area: "support",
        badge: (c) => c.openSupportTickets,
      },
      {
        label: "Activity logs",
        href: "/activity",
        icon: Icons.activity,
        area: "activity",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Markets",
        href: "/markets",
        icon: Icons.globe,
        area: "markets",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Icons.settings,
        area: "settings",
      },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { canAccess, dashboard, toast } = useAdminData();
  const environment = (
    process.env.NEXT_PUBLIC_MARKETLIFT_ENVIRONMENT ||
    process.env.NODE_ENV ||
    "development"
  ).replace(/\b\w/g, (c) => c.toUpperCase());
  async function logout() {
    try {
      await apiRequest<void>("/api/v1/auth/logout/", { method: "POST" });
      onNavigate?.();
      router.replace("/login");
      router.refresh();
    } catch (e) {
      toast(
        "Sign out failed",
        e instanceof Error ? e.message : undefined,
        "danger",
      );
    }
  }
  return (
    <aside
      aria-label="Marketlift administration"
      className="flex h-full w-68 flex-col bg-[#0b1512] text-slate-300"
    >
      <div className="flex h-18.5 items-center border-b border-white/8 px-5">
        <SafeLink
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onNavigate}
        >
          <div className="grid size-9 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
            <svg viewBox="0 0 32 32" className="size-6" fill="none">
              <path
                d="M7 22V10h4l5 6 5-6h4v12h-4v-6l-5 6-5-6v6H7Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <div className="text-[17px] font-black tracking-tight text-white">
              Marketlift
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[.24em] text-emerald-400">
              Admin console
            </div>
          </div>
        </SafeLink>
      </div>
      <nav
        aria-label="Primary administration navigation"
        className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none"
      >
        {sections.map((section) => {
          const items = section.items.filter((item) => canAccess(item.area));
          if (!items.length) return null;
          return (
            <div key={section.label} className="mb-5">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.13em] text-slate-500">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const count = item.badge?.(dashboard.counts) || 0;
                  return (
                    <SafeLink
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition ${active ? "bg-emerald-500/12 text-emerald-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                    >
                      <Icon
                        size={18}
                        className={
                          active
                            ? "text-emerald-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        }
                      />
                      <span className="flex-1">{item.label}</span>
                      {count > 0 && (
                        <span
                          aria-label={`${count} items need attention`}
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? "bg-emerald-400/15 text-emerald-300" : "bg-white/7 text-slate-400"}`}
                        >
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </SafeLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/8 p-3">
        <div className="mb-2 rounded-xl bg-white/[.035] px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
              Environment
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
              <i
                aria-hidden="true"
                className="size-1.5 rounded-full bg-emerald-400"
              />
              {environment}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
        >
          <Icons.logout size={18} /> Sign out
        </button>
      </div>
    </aside>
  );
}
