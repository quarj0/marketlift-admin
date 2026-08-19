"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icons } from "@/lib/icons";
import { Dialog } from "@/components/ui/dialog";
import { SafeLink } from "@/components/ui/safe-link";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

const commands = [
  ["Dashboard", "/dashboard", "Overview"], ["Users", "/users", "Marketplace"], ["Sellers", "/sellers", "Marketplace"],
  ["Listings", "/listings", "Marketplace"], ["Categories", "/categories", "Marketplace"], ["Moderation", "/moderation", "Trust & Safety"],
  ["Verifications", "/verifications", "Trust & Safety"], ["Reports", "/reports", "Trust & Safety"], ["Subscriptions", "/subscriptions", "Revenue"],
  ["Payments", "/payments", "Revenue"], ["Promotions", "/promotions", "Revenue"], ["Analytics", "/analytics", "Operations"],
  ["Support", "/support", "Operations"], ["Activity logs", "/activity", "Operations"], ["Settings", "/settings", "System"],
] as const;

const notifications = [
  { id: "verification-queue", title: "18 verification requests", description: "New seller identity checks are waiting", href: "/verifications", tone: "amber" },
  { id: "flagged-listings", title: "24 flagged listings", description: "Moderation queue has new reports", href: "/moderation", tone: "red" },
  { id: "payment-failures", title: "6 payment failures", description: "Subscription payments require review", href: "/payments", tone: "red" },
  { id: "support-tickets", title: "12 support tickets", description: "High priority tickets are open", href: "/support", tone: "blue" },
] as const;

const NOTIFICATION_STORAGE_KEY = "marketlift-admin-notifications-read-v1";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { toast } = useAdminDemo();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const notificationStorageReady = useRef(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setNotificationsOpen(false); setProfileOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [notificationsOpen, profileOpen]);

  useEffect(() => {
    let active = true;
    try {
      const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const knownIds = new Set(notifications.map((item) => item.id));
      const storedIds = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string" && knownIds.has(id as (typeof notifications)[number]["id"]))
        : [];
      queueMicrotask(() => {
        if (!active) return;
        setReadNotificationIds(storedIds);
        notificationStorageReady.current = true;
      });
    } catch {
      notificationStorageReady.current = true;
    }
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!notificationStorageReady.current) return;
    try { window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(readNotificationIds)); } catch {}
  }, [readNotificationIds]);

  const unreadCount = notifications.reduce((count, item) => count + (readNotificationIds.includes(item.id) ? 0 : 1), 0);

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((current) => current.includes(id) ? current : [...current, id]);
  }, []);

  const markAllRead = useCallback(() => {
    if (unreadCount === 0) return;
    const count = unreadCount;
    setReadNotificationIds(notifications.map((item) => item.id));
    toast("All notifications marked as read", `${count} notification${count === 1 ? "" : "s"} cleared from your unread queue.`);
  }, [toast, unreadCount]);

  const results = useMemo(() => commands.filter((item) => `${item[0]} ${item[2]}`.toLowerCase().includes(query.toLowerCase().trim())), [query]);

  return <>
    <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200 bg-white/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenu} aria-label="Open navigation" className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"><Icons.menu size={20}/></button>
        <button type="button" onClick={openSearch} aria-label="Search admin console" className="group relative hidden h-10 w-[360px] items-center rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-12 text-left text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white md:flex">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><span className="truncate">Search console…</span><kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400">⌘ K</kbd>
        </button>
        <button type="button" onClick={openSearch} aria-label="Search admin console" className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"><Icons.search size={19}/></button>
      </div>
      <div className="relative flex items-center gap-2 sm:gap-3">
        <button type="button" onClick={() => { setNotificationsOpen((v) => !v); setProfileOpen(false); }} aria-haspopup="true" aria-controls="admin-notifications-panel" aria-expanded={notificationsOpen} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications, none unread"} className="relative grid size-10 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100"><Icons.bell size={20} aria-hidden="true"/>{unreadCount > 0 && <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500"/>}</button>
        <div className="hidden h-7 w-px bg-slate-200 sm:block"/>
        <button type="button" onClick={() => { setProfileOpen((v) => !v); setNotificationsOpen(false); }} aria-haspopup="true" aria-controls="admin-profile-panel" aria-expanded={profileOpen} aria-label="Open administrator profile menu" className="flex items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-slate-50">
          <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">AM</span>
          <span className="hidden sm:block"><span className="block text-xs font-bold text-slate-900">Ana Martins</span><span className="block text-[10px] text-slate-500">Super admin</span></span>
          <Icons.arrowDown size={13} className="hidden text-slate-400 sm:block"/>
        </button>
        {notificationsOpen && <div id="admin-notifications-panel" aria-label="Administrator notifications" className="absolute right-12 top-12 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 sm:right-40">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
            <div><p className="text-sm font-black">Notifications</p><p className="text-[10px] text-slate-400">{unreadCount ? `${unreadCount} item${unreadCount === 1 ? "" : "s"} need attention` : "You're all caught up"}</p></div>
            <button type="button" onClick={markAllRead} disabled={unreadCount === 0} className="shrink-0 text-[10px] font-bold text-emerald-700 transition hover:text-emerald-800 disabled:cursor-default disabled:text-slate-300">{unreadCount === 0 ? "All read" : "Mark all read"}</button>
          </div>
          <div className="divide-y divide-slate-100">{notifications.map((item) => {
            const isRead = readNotificationIds.includes(item.id);
            return <SafeLink key={item.id} href={item.href} onClick={() => { markNotificationRead(item.id); setNotificationsOpen(false); }} className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${isRead ? "bg-slate-50/40" : "bg-white"}`}>
              <span aria-hidden="true" className={`mt-1 size-2 shrink-0 rounded-full ${isRead ? "bg-slate-200" : item.tone === "red" ? "bg-red-500" : item.tone === "amber" ? "bg-amber-500" : "bg-blue-500"}`}/>
              <span><span className={`block text-xs ${isRead ? "font-semibold text-slate-500" : "font-black text-slate-800"}`}>{item.title}</span><span className={`mt-0.5 block text-[10px] leading-4 ${isRead ? "text-slate-400" : "text-slate-500"}`}>{item.description}</span></span>
            </SafeLink>;
          })}</div>
        </div>}
        {profileOpen && <div id="admin-profile-panel" aria-label="Administrator profile options" className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-950/10">
          <div className="border-b border-slate-100 px-3 py-2.5"><p className="text-xs font-black text-slate-900">Ana Martins</p><p className="mt-0.5 text-[10px] text-slate-400">ana@marketlift.br</p></div>
          <SafeLink href="/settings" onClick={() => setProfileOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Icons.settings size={15}/> Account settings</SafeLink>
          <SafeLink href="/activity" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Icons.activity size={15}/> My activity</SafeLink>
          <SafeLink href="/login" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Icons.logout size={15}/> Sign out</SafeLink>
        </div>}
      </div>
    </header>

    <Dialog open={searchOpen} onClose={() => { setSearchOpen(false); setQuery(""); }} title="Search Marketlift admin" description="Jump directly to any area of the administration console." size="lg">
      <div className="relative"><Icons.search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><label htmlFor="admin-command-search" className="sr-only">Search admin destinations</label><input id="admin-command-search" data-dialog-autofocus type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10" placeholder="Search dashboard, users, reports…"/></div>
      <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-slate-100">{results.length ? results.map(([label, href, group]) => <SafeLink key={href} href={href} onClick={() => { setSearchOpen(false); setQuery(""); }} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"><div><p className="text-sm font-bold text-slate-800">{label}</p><p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{group}</p></div><Icons.chevronRight size={16} className="text-slate-300"/></SafeLink>) : <div className="p-8 text-center text-sm text-slate-500">No matching admin destination.</div>}</div>
    </Dialog>
  </>;
}
