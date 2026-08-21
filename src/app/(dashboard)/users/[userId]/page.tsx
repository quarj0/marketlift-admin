"use client";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { SafeLink } from "@/components/ui/safe-link";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions } from "@/components/admin/entity-actions";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { Icons } from "@/lib/icons";

export default function UserDetailPage() {
  const params=useParams<{userId:string}>();
  const {users,listings,reports,loading}=useAdminData();
  const user=users.find((x)=>x.id===params.userId);
  if(loading&&!user)return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading account…</div>;
  if(!user)return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-lg font-black">Account not found</h1><SafeLink href="/users" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Back to users</SafeLink></div>;
  const sellerListings=user.sellerId?listings.filter((x)=>x.publicSellerId===user.sellerId):[];
  const userReports=reports.filter((x)=>x.type==="User"&&x.targetId===user.id);
  return <div className="space-y-6">
    <SafeLink href="/users" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800">← Back to users</SafeLink>
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-base font-black text-emerald-700">{user.avatar}</span><div><div className="flex items-center gap-2"><h1 className="text-xl font-black text-slate-950">{user.name}</h1><LiveStatusBadge kind="user" id={user.id} status={user.status}/></div><p className="mt-1 text-xs text-slate-500">{user.email} · {user.id}</p></div></div><EntityActions kind="user" id={user.id} name={user.name} status={user.status}/></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black text-slate-900">Account information</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Info icon={<Icons.mail size={16}/>} label="Email" value={user.email}/><Info icon={<Icons.phone size={16}/>} label="Phone" value={user.phone}/><Info icon={<Icons.users size={16}/>} label="Account type" value={user.type}/><Info icon={<Icons.calendar size={16}/>} label="Joined" value={user.joined}/><Info icon={<Icons.store size={16}/>} label="Location" value={user.location}/><Info icon={<Icons.shield size={16}/>} label="Access status" value={user.status}/></div></section>
      <aside className="space-y-6"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black text-slate-900">Account health</h2><div className="mt-5 space-y-4"><Health label="Reports against user" value={String(userReports.length)} tone={userReports.length===0?"good":undefined}/><Health label="Seller listings" value={String(sellerListings.length)}/><Health label="Seller capability" value={user.sellerId?"Active":"Not activated"}/><Health label="Administrator role" value={user.adminRole||"—"}/></div></section><section className="rounded-xl border border-blue-200 bg-blue-50/40 p-5"><div className="flex items-center gap-2 text-sm font-black text-blue-950"><Icons.lock size={17}/>Read-only profile</div><p className="mt-2 text-xs leading-5 text-blue-900/70">Profile details remain controlled by the account holder. Administrators can enforce account access without editing personal profile information.</p></section></aside>
    </div>
  </div>;
}
function Info({icon,label,value}:{icon:ReactNode;label:string;value:string}){return <div className="flex gap-3"><span className="mt-0.5 text-slate-400">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold text-slate-800">{value}</p></div></div>}
function Health({label,value,tone}:{label:string;value:string;tone?:"good"}){return <div className="flex items-center justify-between text-xs"><span className="text-slate-500">{label}</span><strong className={tone==="good"?"text-emerald-600":"text-slate-900"}>{value}</strong></div>}
