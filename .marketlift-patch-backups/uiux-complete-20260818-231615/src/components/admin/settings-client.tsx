"use client";

import { useState } from "react";
import { AdminButton } from "@/components/ui/admin-button";
import { Icons } from "@/lib/icons";

function Switch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return <button type="button" onClick={onChange} aria-pressed={enabled} className={`relative h-6 w-11 rounded-full transition ${enabled ? "bg-emerald-600" : "bg-slate-200"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`}/></button>;
}

export function SettingsClient() {
  const [registration, setRegistration] = useState(true);
  const [sellerSignup, setSellerSignup] = useState(true);
  const [autoFlag, setAutoFlag] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [email, setEmail] = useState(true);
  return <div className="grid gap-6 xl:grid-cols-[230px_1fr]">
    <aside className="self-start rounded-xl border border-slate-200 bg-white p-2 xl:sticky xl:top-24">{[["General",Icons.settings],["Marketplace",Icons.store],["Trust & safety",Icons.shield],["Notifications",Icons.bell],["Admin access",Icons.lock]].map(([label,Icon],i)=>{const C=Icon as typeof Icons.settings;return <button key={String(label)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold ${i===0?"bg-emerald-50 text-emerald-800":"text-slate-500 hover:bg-slate-50"}`}><C size={16}/>{String(label)}</button>})}</aside>
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black">General settings</h2><p className="mt-0.5 text-xs text-slate-500">Platform identity and public configuration.</p></div><div className="grid gap-5 p-5 sm:grid-cols-2"><Field label="Platform name" value="Marketlift"/><Field label="Support email" value="support@marketlift.br"/><Field label="Primary domain" value="marketlift.br"/><Field label="Admin domain" value="dash.marketlift.br"/><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold text-slate-700">Marketplace description</span><textarea defaultValue="Buy and sell products safely across Brazil." className="min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"/></label></div><div className="flex justify-end border-t border-slate-100 px-5 py-4"><AdminButton>Save changes</AdminButton></div></section>
      <section className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black">Marketplace controls</h2><p className="mt-0.5 text-xs text-slate-500">Global availability and onboarding controls.</p></div><div className="divide-y divide-slate-100 px-5"><Toggle title="User registration" description="Allow new buyers to create Marketlift accounts." enabled={registration} action={()=>setRegistration(!registration)}/><Toggle title="Seller registration" description="Allow eligible users to start seller onboarding." enabled={sellerSignup} action={()=>setSellerSignup(!sellerSignup)}/><Toggle title="Automated listing flagging" description="Send high-risk marketplace content to moderation review." enabled={autoFlag} action={()=>setAutoFlag(!autoFlag)}/><Toggle title="Maintenance mode" description="Temporarily disable public marketplace access." enabled={maintenance} action={()=>setMaintenance(!maintenance)}/></div></section>
      <section className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black">Administrator notifications</h2></div><div className="px-5"><Toggle title="Email operational alerts" description="Receive high-priority trust, payment and platform alerts." enabled={email} action={()=>setEmail(!email)}/></div></section>
      <section className="rounded-xl border border-red-200 bg-red-50/20 p-5"><div className="flex items-start gap-3"><Icons.alert className="mt-0.5 shrink-0 text-red-600" size={18}/><div className="flex-1"><h2 className="text-sm font-black text-red-900">Danger zone</h2><p className="mt-1 text-xs leading-5 text-red-700/70">These actions affect the entire marketplace and should require re-authentication plus an audit reason.</p><div className="mt-4 flex flex-wrap gap-2"><AdminButton variant="danger">Enable maintenance mode</AdminButton><AdminButton variant="outline">Invalidate all sessions</AdminButton></div></div></div></section>
    </div>
  </div>;
}
function Field({label,value}:{label:string;value:string}){return <label><span className="mb-2 block text-xs font-bold text-slate-700">{label}</span><input defaultValue={value} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"/></label>}
function Toggle({title,description,enabled,action}:{title:string;description:string;enabled:boolean;action:()=>void}){return <div className="flex items-center justify-between gap-4 py-4"><div><p className="text-xs font-bold text-slate-800">{title}</p><p className="mt-1 text-[11px] text-slate-500">{description}</p></div><Switch enabled={enabled} onChange={action}/></div>}
