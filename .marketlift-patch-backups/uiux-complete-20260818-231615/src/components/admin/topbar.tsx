"use client";

import { Icons } from "@/lib/icons";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
    <div className="flex min-w-0 items-center gap-3">
      <button onClick={onMenu} aria-label="Open navigation" className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"><Icons.menu size={20}/></button>
      <div className="relative hidden w-[320px] md:block">
        <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/>
        <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10" placeholder="Search users, sellers, listings..."/>
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400">⌘ K</kbd>
      </div>
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <button aria-label="Notifications" className="relative grid size-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"><Icons.bell size={20}/><span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500"/></button>
      <div className="hidden h-7 w-px bg-slate-200 sm:block"/>
      <button className="flex items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-slate-50">
        <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">AM</span>
        <span className="hidden sm:block"><span className="block text-xs font-bold text-slate-900">Ana Martins</span><span className="block text-[10px] text-slate-500">Super admin</span></span>
        <Icons.arrowDown size={13} className="hidden text-slate-400 sm:block"/>
      </button>
    </div>
  </header>;
}
