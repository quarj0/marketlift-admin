"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { Icons } from "@/lib/icons";
import { exportCsv } from "@/lib/csv-export";
import { useAdminData } from "@/components/admin/admin-data-provider";
import type { PlanRecord } from "@/types/admin";

type PlanForm = { name:string; monthlyPrice:string; yearlyPrice:string; listingLimit:string; promotionCredits:string; visibilityWeight:string; recommended:boolean; active:boolean; features:string };
const emptyForm:PlanForm={name:"",monthlyPrice:"0",yearlyPrice:"0",listingLimit:"5",promotionCredits:"0",visibilityWeight:"1",recommended:false,active:true,features:""};

export default function SubscriptionsPage() {
  const [editing, setEditing] = useState<PlanRecord | "new" | null>(null);
  const [form,setForm]=useState<PlanForm>(emptyForm);
  const [busy,setBusy]=useState(false);
  const { plans, subscriptions, saveSellerPlan } = useAdminData();

  useEffect(()=>{
    if(editing === "new") setForm(emptyForm);
    else if(editing) setForm({name:editing.name,monthlyPrice:String(editing.priceValue),yearlyPrice:String(editing.yearlyPriceValue),listingLimit:String(editing.listings),promotionCredits:String(editing.featured),visibilityWeight:String(editing.visibilityWeight),recommended:editing.recommended,active:editing.active,features:editing.features.join("\n")});
  },[editing]);

  const save=async()=>{
    if(!editing || form.name.trim().length<2) return;
    setBusy(true);
    const ok=await saveSellerPlan({
      id:editing === "new" ? undefined : editing.id,
      name:form.name.trim(), monthlyPrice:Number(form.monthlyPrice||0), yearlyPrice:Number(form.yearlyPrice||0),
      listingLimit:Number(form.listingLimit||0), promotionCredits:Number(form.promotionCredits||0), visibilityWeight:Number(form.visibilityWeight||1),
      recommended:form.recommended, active:form.active, features:form.features.split("\n").map(x=>x.trim()).filter(Boolean),
    });
    setBusy(false); if(ok) setEditing(null);
  };

  return <div className="space-y-6">
    <PageHeader title="Subscriptions" description="Manage seller plans and review current seller subscriptions." actions={<AdminButton onClick={()=>setEditing("new")}>+ Create plan</AdminButton>} />

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((item)=><article key={item.id} className="relative rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-lg hover:shadow-slate-950/5">
        <div className="flex items-center justify-between gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-500">{item.name}</span>{item.badge&&<span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">{item.badge}</span>}</div>
        <div className="mt-4"><strong className="text-2xl font-black text-slate-950">{item.price}</strong><span className="text-xs text-slate-400">{item.period}</span></div>
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs"><Row label="Current sellers" value={item.sellers.toLocaleString("pt-BR")}/><Row label="Listing limit" value={String(item.listings)}/><Row label="Promotion credits" value={String(item.featured)}/><Row label="Status" value={item.active?"Active":"Inactive"}/></div>
        <button type="button" onClick={()=>setEditing(item)} className="mt-5 w-full rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Edit plan</button>
      </article>)}
    </div>

    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 py-4"><div><h2 className="text-sm font-black">Seller subscriptions</h2><p className="mt-0.5 text-xs text-slate-500">Current subscription records returned by Marketlift billing</p></div><AdminButton variant="outline" onClick={()=>exportCsv("marketlift-subscriptions.csv",["ID","Seller","Plan","Billing cycle","Period end","Status","Promotion credits"],subscriptions.map(s=>[s.id,s.sellerName,s.planName,s.billingCycle,s.periodEnd,s.status,s.promotionCreditsRemaining]))}><Icons.download size={15}/> Export</AdminButton></div>
      <div className="table-scroll"><table className="admin-table" aria-label="Seller subscriptions"><thead><tr><th>Seller</th><th>Plan</th><th>Billing cycle</th><th>Period end</th><th>Promotion credits</th><th>Status</th></tr></thead><tbody>{subscriptions.map(s=><tr key={s.id}><td><div className="font-bold text-slate-900">{s.sellerName}</div><div className="text-[10px] text-slate-400">{s.id}</div></td><td>{s.planName}</td><td>{s.billingCycle}</td><td>{s.periodEnd}</td><td>{s.promotionCreditsRemaining}</td><td><StatusBadge status={s.status}/></td></tr>)}</tbody></table></div>
      {subscriptions.length===0&&<div className="border-t border-slate-100 p-8 text-center text-xs text-slate-500">No subscription records are available.</div>}
    </section>

    <Dialog open={editing!==null} onClose={()=>setEditing(null)} title={editing==="new"?"Create subscription plan":`Edit ${editing?.name??"plan"}`} description="Configure seller plan pricing and marketplace limits." footer={<><AdminButton variant="outline" onClick={()=>setEditing(null)}>Cancel</AdminButton><AdminButton disabled={busy||form.name.trim().length<2} onClick={()=>void save()}>{busy?"Saving…":"Save plan"}</AdminButton></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Plan name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))}/><Field label="Monthly price (BRL)" type="number" value={form.monthlyPrice} onChange={v=>setForm(f=>({...f,monthlyPrice:v}))}/><Field label="Yearly price (BRL)" type="number" value={form.yearlyPrice} onChange={v=>setForm(f=>({...f,yearlyPrice:v}))}/><Field label="Listing limit" type="number" value={form.listingLimit} onChange={v=>setForm(f=>({...f,listingLimit:v}))}/><Field label="Promotion credits" type="number" value={form.promotionCredits} onChange={v=>setForm(f=>({...f,promotionCredits:v}))}/><Field label="Visibility weight" type="number" value={form.visibilityWeight} onChange={v=>setForm(f=>({...f,visibilityWeight:v}))}/>
        <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold text-slate-700">Features <span className="font-normal text-slate-400">(one per line)</span></span><textarea value={form.features} onChange={e=>setForm(f=>({...f,features:e.target.value}))} className="min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"/></label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.recommended} onChange={e=>setForm(f=>({...f,recommended:e.target.checked}))}/> Recommended plan</label><label className="flex items-center gap-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/> Active</label>
      </div>
    </Dialog>
  </div>;
}

function Row({label,value}:{label:string;value:string}){return <div className="flex justify-between"><span className="text-slate-500">{label}</span><strong className="text-slate-800">{value}</strong></div>}
function Field({label,value,onChange,type="text"}:{label:string;value:string;onChange:(v:string)=>void;type?:string}){return <label><span className="mb-2 block text-xs font-bold text-slate-700">{label}</span><input type={type} min={type==="number"?0:undefined} step={label.includes("price")?"0.01":"1"} value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"/></label>}
