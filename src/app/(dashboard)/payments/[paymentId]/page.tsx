"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SafeLink } from "@/components/ui/safe-link";
import { StatusBadge } from "@/components/ui/status-badge";
import { graphqlRequest } from "@/lib/api-client";
import { useAdminData } from "@/components/admin/admin-data-provider";
import type { Status } from "@/types/admin";

type Payment={
  id:string; reference:string; sellerId:string; sellerName:string; purpose:string; method:string; status:string;
  amount:number; currency:string; provider:string; providerOrderId:string|null; providerStatus:string|null; providerStatusDetail:string|null;
  planId:string|null; billingCycle:string|null; listingId:string|null; promotionId:string|null;
  createdAt:string; paidAt:string|null; failedAt:string|null; refundedAt:string|null;
};
const QUERY=`query AdminPaymentDetail($id:ID!){adminPayment(id:$id){id reference sellerId sellerName purpose method status amount currency provider providerOrderId providerStatus providerStatusDetail planId billingCycle listingId promotionId createdAt paidAt failedAt refundedAt}}`;
const title=(value?:string|null)=>value?value.replace(/_/g," ").replace(/\b\w/g,(c)=>c.toUpperCase()):"—";
const fmt=(value?:string|null)=>value?new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"—";
const money=(value:number,currency:string)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:currency||"BRL"}).format(value);
const uiStatus=(value:string):Status=>({paid:"Paid",pending:"Pending",failed:"Failed",refunded:"Refunded",cancelled:"Cancelled"}[value.toLowerCase()]||title(value)) as Status;

export default function PaymentDetailPage(){
  const {paymentId}=useParams<{paymentId:string}>();
  const {toast}=useAdminData();
  const [payment,setPayment]=useState<Payment|null>(null);
  const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{setLoading(true);try{const data=await graphqlRequest<{adminPayment:Payment|null}>(QUERY,{id:paymentId});setPayment(data.adminPayment);}catch(e){toast("Payment unavailable",e instanceof Error?e.message:undefined,"danger");}finally{setLoading(false)}},[paymentId,toast]);
  useEffect(()=>{const timeoutId=window.setTimeout(()=>{void load()},0);return()=>window.clearTimeout(timeoutId)},[load]);
  if(loading)return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading payment…</div>;
  if(!payment)return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-lg font-black">Payment not found</h1><SafeLink href="/payments" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Back to payments</SafeLink></div>;
  return <div className="space-y-6">
    <SafeLink href="/payments" className="text-xs font-bold text-slate-500">← Back to payments</SafeLink>
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-black">{payment.reference||payment.id}</h1><StatusBadge status={uiStatus(payment.status)}/></div><p className="mt-1 text-xs text-slate-500">{payment.id} · created {fmt(payment.createdAt)}</p></div><button type="button" onClick={()=>void load()} className="h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Refresh</button></div>
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black">Transaction</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Row label="Amount" value={money(payment.amount,payment.currency)}/><Row label="Purpose" value={title(payment.purpose)}/><Row label="Method" value={title(payment.method)}/><Row label="Billing cycle" value={title(payment.billingCycle)}/><Row label="Created" value={fmt(payment.createdAt)}/><Row label="Paid" value={fmt(payment.paidAt)}/><Row label="Failed" value={fmt(payment.failedAt)}/><Row label="Refunded" value={fmt(payment.refundedAt)}/></div></section>
      <aside className="space-y-6"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black">Provider</h2><dl className="mt-4 space-y-4 text-xs"><Detail label="Provider" value={title(payment.provider)}/><Detail label="Provider order" value={payment.providerOrderId||"—"}/><Detail label="Provider status" value={title(payment.providerStatus)}/><Detail label="Status detail" value={payment.providerStatusDetail||"—"}/></dl></section><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black">Related records</h2><div className="mt-4 space-y-3 text-xs"><LinkRow label="Seller" href={`/sellers/${payment.sellerId}`} value={payment.sellerName}/>{payment.listingId&&<LinkRow label="Listing" href={`/listings/${payment.listingId}`} value={payment.listingId}/>}<Detail label="Plan" value={payment.planId||"—"}/><Detail label="Promotion" value={payment.promotionId||"—"}/></div></section></aside>
    </div>
  </div>;
}
function Row({label,value}:{label:string;value:string}){return <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p></div>}
function Detail({label,value}:{label:string;value:string}){return <div className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className="max-w-[65%] break-words text-right font-bold text-slate-800">{value}</dd></div>}
function LinkRow({label,href,value}:{label:string;href:string;value:string}){return <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{label}</span><SafeLink href={href} className="max-w-[65%] truncate font-bold text-emerald-700">{value}</SafeLink></div>}
