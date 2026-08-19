"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Icons } from "@/lib/icons";

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-dvh bg-[#f7f9f8] text-slate-900">
    <div className="fixed inset-y-0 left-0 z-50 hidden lg:block"><Sidebar/></div>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]" onClick={() => setOpen(false)}/><div className="absolute inset-y-0 left-0 shadow-2xl"><Sidebar onNavigate={() => setOpen(false)}/><button aria-label="Close navigation" className="absolute right-[-46px] top-3 grid size-9 place-items-center rounded-full bg-white text-slate-700 shadow" onClick={() => setOpen(false)}><Icons.close size={19}/></button></div></div>}
    <div className="lg:pl-[260px]"><Topbar onMenu={() => setOpen(true)}/><main className="mx-auto w-full max-w-[1540px] p-4 sm:p-6 lg:p-8">{children}</main></div>
  </div>;
}
