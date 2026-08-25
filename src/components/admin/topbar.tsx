"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import { Dialog } from "@/components/ui/dialog";
import { SafeLink } from "@/components/ui/safe-link";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { apiRequest } from "@/lib/api-client";
import type { AdminArea } from "@/lib/admin-access";

const commands: [string, string, string, AdminArea][] = [
  ["Dashboard", "/dashboard", "Overview", "dashboard"],
  ["Users", "/users", "Marketplace", "users"],
  ["Sellers", "/sellers", "Marketplace", "sellers"],
  ["Listings", "/listings", "Marketplace", "listings"],
  ["Categories", "/categories", "Marketplace", "categories"],
  ["Moderation", "/moderation", "Trust & Safety", "moderation"],
  ["Verifications", "/verifications", "Trust & Safety", "verifications"],
  ["Reports", "/reports", "Trust & Safety", "reports"],
  ["Subscriptions", "/subscriptions", "Revenue", "subscriptions"],
  ["Payments", "/payments", "Revenue", "payments"],
  ["Promotions", "/promotions", "Revenue", "promotions"],
  ["Markets", "/markets", "System", "markets"],
  ["Analytics", "/analytics", "Operations", "analytics"],
  ["Support", "/support", "Operations", "support"],
  ["Activity logs", "/activity", "Operations", "activity"],
  ["Settings", "/settings", "System", "settings"],
];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const {
    sessionUser,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    canAccess,
    toast,
  } = useAdminData();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(
    () =>
      commands.filter(
        (item) =>
          canAccess(item[3]) &&
          `${item[0]} ${item[2]}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
    [canAccess, query],
  );
  const initials = (sessionUser?.name || "Admin")
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
  const logout = useCallback(async () => {
    try {
      await apiRequest<void>("/api/v1/auth/logout/", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (e) {
      toast(
        "Sign out failed",
        e instanceof Error ? e.message : undefined,
        "danger",
      );
    }
  }, [router, toast]);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-18.5 items-center justify-between border-b border-slate-200 bg-white/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Open navigation"
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Icons.menu size={20} />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search admin console"
            className="group relative hidden h-10 w-90 items-center rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-12 text-left text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white md:flex"
          >
            <Icons.search
              className="absolute left-3 top-1/2 -translate-y-1/2"
              size={17}
            />
            <span>Search console…</span>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold">
              ⌘ K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search admin console"
            className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <Icons.search size={19} />
          </button>
        </div>
        <div className="relative flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((v) => !v);
              setProfileOpen(false);
            }}
            aria-label={
              unreadNotificationCount
                ? `Notifications, ${unreadNotificationCount} unread`
                : "Notifications"
            }
            className="relative grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Icons.bell size={20} />
            {unreadNotificationCount > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500" />
            )}
          </button>
          <div className="hidden h-7 w-px bg-slate-200 sm:block" />
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-50"
          >
            <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
              {initials || "A"}
            </span>
            <span className="hidden sm:block">
              <span className="block text-xs font-bold text-slate-900">
                {sessionUser?.name || "Administrator"}
              </span>
              <span className="block text-[10px] text-slate-500">
                {(sessionUser?.adminRole || "admin").replace(/_/g, " ")}
              </span>
            </span>
            <Icons.arrowDown
              size={13}
              className="hidden text-slate-400 sm:block"
            />
          </button>
          {notificationsOpen && (
            <div className="absolute right-12 top-12 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:right-40">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-black">
                    Operational notifications
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {unreadNotificationCount
                      ? `${unreadNotificationCount} unread`
                      : "You're all caught up"}
                  </p>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllNotificationsRead()}
                    className="text-[10px] font-bold text-emerald-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-105 divide-y divide-slate-100 overflow-y-auto">
                {notifications.length ? (
                  notifications.map((item) => {
                    const href =
                      item.href && item.href.startsWith("/")
                        ? item.href
                        : "/dashboard";
                    return (
                      <SafeLink
                        key={item.id}
                        href={href}
                        onClick={() => {
                          void markNotificationRead(item.id);
                          setNotificationsOpen(false);
                        }}
                        className={`flex gap-3 px-4 py-3 hover:bg-slate-50 ${item.read ? "bg-slate-50/40" : ""}`}
                      >
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${item.read ? "bg-slate-200" : "bg-emerald-500"}`}
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-black text-slate-800">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                            {item.body}
                          </span>
                          <span className="mt-1 block text-[9px] font-semibold text-slate-400">
                            {item.createdAt}
                          </span>
                        </span>
                      </SafeLink>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No operational notifications.
                  </div>
                )}
              </div>
            </div>
          )}
          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-black">
                  {sessionUser?.name || "Administrator"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {sessionUser?.email || ""}
                </p>
              </div>
              {canAccess("settings") && (
                <SafeLink
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Icons.settings size={15} /> Settings
                </SafeLink>
              )}
              {canAccess("activity") && (
                <SafeLink
                  href="/activity"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Icons.activity size={15} /> Activity log
                </SafeLink>
              )}
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <Icons.logout size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <Dialog
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        title="Search Marketlift admin"
        description="Jump directly to any area you can access."
        size="lg"
      >
        <div className="relative">
          <Icons.search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            data-dialog-autofocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
            placeholder="Search dashboard, users, reports…"
          />
        </div>
        <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-slate-100">
          {results.length ? (
            results.map(([label, href, group]) => (
              <SafeLink
                key={href}
                href={href}
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    {group}
                  </p>
                </div>
                <Icons.chevronRight size={16} />
              </SafeLink>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching admin destination.
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
