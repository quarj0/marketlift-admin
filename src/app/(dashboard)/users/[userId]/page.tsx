"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { SafeLink } from "@/components/ui/safe-link";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions } from "@/components/admin/entity-actions";
import { graphqlRequest } from "@/lib/api-client";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { Icons } from "@/lib/icons";

type User={id:string;name:string;email:string;phone:string|null;active:boolean;staff:boolean;suspended:boolean;joinedAt:string;location:{state:string;stateCode:string;city:string;district:string|null};sellerId:string|null;adminRole:string|null};
const QUERY=`query AdminUserDetail($id:ID!){adminUser(id:$id){id name email phone active staff suspended joinedAt location{state stateCode city district} sellerId adminRole}}`;
const fmt=(value:string)=>new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
const loc=(u:User)=>[u.location.district,u.location.city,u.location.stateCode||u.location.state].filter(Boolean).join(", ")||"—";
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map((x)=>x[0]?.toUpperCase()).join("")||"ML";

export default function UserDetailPage(){
  const {userId}=useParams<{userId:string}>(); const {toast}=useAdminData(); const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{setLoading(true);try{const d=await graphqlRequest<{adminUser:User|null}>(QUERY,{id:userId});setUser(d.adminUser);}catch(e){toast("Account unavailable",e instanceof Error?e.message:undefined,"danger");}finally{setLoading(false)}},[userId,toast]);
  useEffect(()=>{const timeoutId=window.setTimeout(()=>{void load()},0);return()=>window.clearTimeout(timeoutId)},[load]);
  if(loading)return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading account…</div>;
  if(!user)return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-lg font-black">Account not found</h1><SafeLink href="/users" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Back to users</SafeLink></div>;
  const status=user.suspended?"Suspended":user.active?"Active":"Pending"; const type=user.staff?"Administrator":user.sellerId?"Buyer & Seller":"Buyer";
  return <div className="space-y-6">
    <SafeLink href="/users" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800">← Back to users</SafeLink>
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-base font-black text-emerald-700">{initials(user.name)}</span><div><div className="flex items-center gap-2"><h1 className="text-xl font-black text-slate-950">{user.name}</h1><LiveStatusBadge kind="user" id={user.id} status={status}/></div><p className="mt-1 text-xs text-slate-500">{user.email} · {user.id}</p></div></div><EntityActions kind="user" id={user.id} name={user.name} status={status}/></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black text-slate-900">Account information</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Info icon={<Icons.mail size={16}/>} label="Email" value={user.email}/><Info icon={<Icons.phone size={16}/>} label="Phone" value={user.phone||"—"}/><Info icon={<Icons.users size={16}/>} label="Account type" value={type}/><Info icon={<Icons.calendar size={16}/>} label="Joined" value={fmt(user.joinedAt)}/><Info icon={<Icons.store size={16}/>} label="Location" value={loc(user)}/><Info icon={<Icons.shield size={16}/>} label="Access status" value={status}/></div></section>
      <aside className="space-y-6"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black text-slate-900">Access</h2><div className="mt-5 space-y-4"><Health label="Seller capability" value={user.sellerId?"Activated":"Not activated"}/><Health label="Administrator role" value={user.adminRole?.replace(/_/g," ")||"—"}/>{user.sellerId&&<div className="pt-2"><SafeLink href={`/sellers/${user.sellerId}`} className="text-xs font-black text-emerald-700">Open seller profile →</SafeLink></div>}</div></section><section className="rounded-xl border border-blue-200 bg-blue-50/40 p-5"><div className="flex items-center gap-2 text-sm font-black text-blue-950"><Icons.lock size={17}/>Read-only profile</div><p className="mt-2 text-xs leading-5 text-blue-900/70">Profile details remain controlled by the account holder. Administrators can enforce account access without editing personal profile information.</p></section></aside>
    </div>
  </div>;
}
function Info({icon,label,value}:{icon:ReactNode;label:string;value:string}){return <div className="flex gap-3"><span className="mt-0.5 text-slate-400">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold text-slate-800">{value}</p></div></div>}
function Health({label,value}:{label:string;value:string}){return <div className="flex items-center justify-between text-xs"><span className="text-slate-500">{label}</span><strong className="max-w-[60%] text-right capitalize text-slate-900">{value}</strong></div>}
