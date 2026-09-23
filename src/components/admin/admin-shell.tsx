"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Icons } from "@/lib/icons";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { areaForPath } from "@/lib/admin-access";
import { apiRequest } from "@/lib/api-client";

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { sessionUser, loading, error, refresh, canAccess } = useAdminData();
  const area = areaForPath(pathname);
  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = before;
    };
  }, [open]);
  useEffect(() => {
    if (!loading && sessionUser && !canAccess(area))
      router.replace("/dashboard");
  }, [area, canAccess, loading, router, sessionUser]);
  useEffect(() => {
    let cancelled = false;

    const checkMaintenance = async () => {
      try {
        const result = await apiRequest<{ maintenance: boolean }>(
          "/api/v1/health/maintenance/",
        );
        if (!cancelled) setMaintenanceMode(Boolean(result.maintenance));
      } catch {
        // The admin console should remain usable even if the public status
        // probe is temporarily unavailable.
      }
    };

    void checkMaintenance();
    const interval = window.setInterval(checkMaintenance, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);
  const denied = !loading && sessionUser && !canAccess(area);
  return (
    <div className="min-h-dvh bg-[#f6f8f7] text-slate-900">
      <a href="#admin-main" className="skip-link">
        Skip to main content
      </a>
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">
        <Sidebar />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onMouseDown={() => setOpen(false)}
          />
          <div
            className="absolute inset-y-0 left-0 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Administration navigation"
          >
            <Sidebar onNavigate={() => setOpen(false)} />
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute -right-11.5 top-3 grid size-10 place-items-center rounded-full bg-white text-slate-700 shadow"
              onClick={() => setOpen(false)}
            >
              <Icons.close size={19} />
            </button>
          </div>
        </div>
      )}
      <div className="lg:pl-68">
        <Topbar onMenu={() => setOpen(true)} />
        <main
          id="admin-main"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1540px] p-4 pb-10 outline-none sm:p-5 lg:p-6"
        >
          {maintenanceMode && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 flex flex-col gap-2 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <strong className="font-bold">Marketplace maintenance mode is active.</strong>
                <p className="mt-0.5 text-xs leading-5 text-amber-800">
                  Visitors are seeing a temporary maintenance message. The admin console remains available.
                </p>
              </div>
              <Link
                href="/settings"
                className="shrink-0 text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
              >
                Review service settings
              </Link>
            </div>
          )}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <strong className="font-bold">
                  Some administration data could not be loaded.
                </strong>
                <p className="mt-0.5 text-xs leading-5 text-amber-800">
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refresh()}
                className="shrink-0 rounded-md border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                Retry
              </button>
            </div>
          )}
          {loading && !sessionUser ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
              Loading administration session…
            </div>
          ) : denied ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
              This administrator role does not have access to this area.
              Redirecting to the dashboard…
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
