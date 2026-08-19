"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Icons } from "@/lib/icons";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);

      if (!focusable.length) {
        event.preventDefault();
        drawerRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = before;
      window.removeEventListener("keydown", handleKey);
      menuTriggerRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-[#f5f7fb] text-slate-900">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#02122f]/65 backdrop-blur-sm"
            aria-hidden="true"
            onMouseDown={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="absolute inset-y-0 left-0 outline-none shadow-2xl"
          >
            <Sidebar onNavigate={() => setOpen(false)} />
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close navigation"
              className="absolute right-[-50px] top-3 grid size-11 place-items-center rounded-full bg-white text-slate-700 shadow-lg focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
              onClick={() => setOpen(false)}
            >
              <Icons.close size={19} />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-[280px]">
        <Topbar
          onMenu={(trigger) => {
            menuTriggerRef.current = trigger;
            setOpen(true);
          }}
        />
        <main id="admin-main-content" className="mx-auto w-full max-w-[1540px] p-4 pb-12 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
