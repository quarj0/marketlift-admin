"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icons } from "@/lib/icons";
import { Dialog } from "@/components/ui/dialog";
import { SafeLink } from "@/components/ui/safe-link";

const commands = [
  ["Dashboard", "/dashboard", "Overview"],
  ["Users", "/users", "Marketplace"],
  ["Selling profiles", "/sellers", "Marketplace"],
  ["Listings", "/listings", "Marketplace"],
  ["Categories", "/categories", "Marketplace"],
  ["Moderation", "/moderation", "Trust & Safety"],
  ["Verifications", "/verifications", "Trust & Safety"],
  ["Reports", "/reports", "Trust & Safety"],
  ["Selling plans", "/subscriptions", "Revenue"],
  ["Service payments", "/payments", "Revenue"],
  ["Promotions", "/promotions", "Revenue"],
  ["Analytics", "/analytics", "Operations"],
  ["Support", "/support", "Operations"],
  ["Activity logs", "/activity", "Operations"],
  ["Settings", "/settings", "System"],
] as const;

export function Topbar({ onMenu }: { onMenu: (trigger: HTMLButtonElement) => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, []);

  const results = useMemo(
    () =>
      commands.filter((item) =>
        `${item[0]} ${item[2]}`.toLowerCase().includes(query.toLowerCase().trim()),
      ),
    [query],
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white/94 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={(event) => onMenu(event.currentTarget)}
            aria-label="Open navigation"
            className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6] lg:hidden"
          >
            <Icons.menu size={20} />
          </button>

          <button
            type="button"
            onClick={openSearch}
            className="group relative hidden h-11 w-[360px] items-center rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-14 text-left text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white md:flex"
          >
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <span className="truncate">Search admin console…</span>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-400">
              ⌘ K
            </kbd>
          </button>

          <button
            type="button"
            onClick={openSearch}
            aria-label="Search admin console"
            className="grid size-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#0b63f6] md:hidden"
          >
            <Icons.search size={19} />
          </button>
        </div>

        <div ref={wrapperRef} className="relative flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            aria-expanded={notificationsOpen}
            aria-haspopup="menu"
            aria-label="Admin notifications"
            className="relative grid size-11 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
          >
            <Icons.bell size={20} />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-[#ff8a00]" aria-hidden="true" />
          </button>

          <div className="hidden h-7 w-px bg-slate-200 sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex min-h-11 items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
          >
            <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-black text-blue-700">AM</span>
            <span className="hidden sm:block">
              <span className="block text-xs font-bold text-slate-900">Ana Martins</span>
              <span className="block text-[10px] text-slate-500">Super admin</span>
            </span>
            <Icons.arrowDown size={13} className="hidden text-slate-400 sm:block" />
          </button>

          {notificationsOpen && (
            <div role="menu" className="absolute right-12 top-14 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-[#02122f]/10 sm:right-40">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-black">Operational attention</p>
                  <p className="text-[10px] text-slate-400">5 queues need review</p>
                </div>
                <button type="button" className="min-h-11 rounded-xl px-3 text-[10px] font-bold text-[#0b63f6] hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  ["18 verification requests", "Seller identity checks are waiting", "/verifications", "amber"],
                  ["24 flagged listings", "Risk and policy cases are in moderation", "/moderation", "red"],
                  ["7 availability reports", "Buyers say listings may no longer be available", "/reports", "orange"],
                  ["6 payment failures", "Marketlift service payments require review", "/payments", "red"],
                  ["12 support tickets", "High-priority tickets are open", "/support", "blue"],
                ].map(([title, description, href, tone]) => (
                  <SafeLink
                    key={title}
                    href={href}
                    role="menuitem"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex gap-3 px-4 py-3 transition hover:bg-slate-50 focus-visible:bg-slate-50"
                  >
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${
                        tone === "red"
                          ? "bg-red-500"
                          : tone === "amber"
                            ? "bg-amber-500"
                            : tone === "orange"
                              ? "bg-[#ff8a00]"
                              : "bg-[#0b63f6]"
                      }`}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-xs font-black text-slate-800">{title}</span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{description}</span>
                    </span>
                  </SafeLink>
                ))}
              </div>
            </div>
          )}

          {profileOpen && (
            <div role="menu" className="absolute right-0 top-14 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-[#02122f]/10">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-black text-slate-900">Ana Martins</p>
                <p className="mt-0.5 text-[10px] text-slate-400">ana@marketlift.br</p>
              </div>
              <SafeLink href="/settings" role="menuitem" onClick={() => setProfileOpen(false)} className="mt-1 flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                <Icons.settings size={15} /> Account settings
              </SafeLink>
              <SafeLink href="/activity" role="menuitem" onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                <Icons.activity size={15} /> My activity
              </SafeLink>
              <SafeLink href="/login" role="menuitem" className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500">
                <Icons.logout size={15} /> Sign out
              </SafeLink>
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
        description="Jump to any area of the operations console."
        size="lg"
      >
        <label className="relative block">
          <span className="sr-only">Search admin destinations</span>
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-[#0b63f6] focus:bg-white focus:ring-2 focus:ring-[#0b63f6]/10"
            placeholder="Search dashboard, users, reports…"
          />
        </label>
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
                className="flex min-h-14 items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{group}</p>
                </div>
                <Icons.chevronRight size={16} className="text-slate-300" />
              </SafeLink>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">No matching admin destination.</div>
          )}
        </div>
      </Dialog>
    </>
  );
}
