import Link from "next/link";
import { Icons } from "@/lib/icons";

export default function LoginPage() {
  return <main className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-[#0d1714] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-32 size-96 rounded-full bg-emerald-500/10 blur-3xl"/>
      <div className="absolute -bottom-40 -left-16 size-[460px] rounded-full bg-emerald-400/8 blur-3xl"/>
      <div className="relative flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white"><svg viewBox="0 0 32 32" className="size-7" fill="none"><path d="M7 22V10h4l5 6 5-6h4v12h-4v-6l-5 6-5-6v6H7Z" fill="currentColor"/></svg></div><div><div className="text-xl font-black">Marketlift</div><div className="text-[10px] font-bold uppercase tracking-[.28em] text-emerald-400">Admin Console</div></div></div>
      <div className="relative max-w-xl"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/8 px-3 py-1.5 text-xs font-bold text-emerald-300"><Icons.shield size={15}/> Secure operations workspace</div><h1 className="text-5xl font-black leading-[1.06] tracking-[-.04em]">Run the marketplace with clarity and control.</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-400">Manage users, sellers, listings, trust & safety, subscriptions and marketplace health from one secure workspace.</p></div>
      <p className="relative text-xs text-slate-600">© 2026 Marketlift. Authorized personnel only.</p>
    </section>
    <section className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-[420px]">
      <div className="mb-8 flex items-center gap-3 lg:hidden"><div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white"><svg viewBox="0 0 32 32" className="size-7" fill="none"><path d="M7 22V10h4l5 6 5-6h4v12h-4v-6l-5 6-5-6v6H7Z" fill="currentColor"/></svg></div><div><div className="font-black">Marketlift</div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-emerald-600">Admin</div></div></div>
      <h2 className="text-3xl font-black tracking-tight text-slate-950">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Sign in with your administrator account.</p>
      <form className="mt-8 space-y-5">
        <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Email address</span><div className="relative"><Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="email" defaultValue="admin@marketlift.br" className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"/></div></label>
        <label className="block"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-slate-700">Password</span><button type="button" className="text-xs font-bold text-emerald-700">Forgot password?</button></div><div className="relative"><Icons.lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="password" defaultValue="marketliftadmin" className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"/></div></label>
        <Link href="/dashboard" className="flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-700">Sign in to admin</Link>
      </form>
      <div className="mt-8 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500"><Icons.shield size={16} className="mt-0.5 shrink-0 text-slate-400"/>This console contains sensitive marketplace data. All administrative actions are logged.</div>
    </div></section>
  </main>;
}
