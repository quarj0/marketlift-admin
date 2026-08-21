"use client";

import type { ReactNode } from "react";
import { SafeLink } from "@/components/ui/safe-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icons } from "@/lib/icons";
import { useAdminData } from "@/components/admin/admin-data-provider";

const iconCycle=[Icons.arrowUp,Icons.megaphone,Icons.dashboard];
export default function PromotionsPage(){
  const {payments,listings,promotionProducts}=useAdminData();
  const listingById=new Map(listings.map(l=>[l.id,l]));
  const productById=new Map(promotionProducts.map(p=>[p.id,p]));
  const rows=payments.filter(p=>p.purpose.toLowerCase().includes("promotion")||Boolean(p.promotionId));
  return <div className="space-y-6"><PageHeader title="Promotions" description="Review promotion products and seller promotion purchases."/>
    <div className="grid gap-4 lg:grid-cols-3">{promotionProducts.map((product,index)=>{const Icon=iconCycle[index%iconCycle.length];return <Promo key={product.id} title={product.name} price={product.price} description={product.description||`Runs for ${product.durationDays} day${product.durationDays===1?"":"s"}.`} icon={<Icon size={20}/>} duration={product.durationDays}/>})}</div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="px-5 py-4"><h2 className="text-sm font-black">Promotion purchases</h2><p className="mt-0.5 text-xs text-slate-500">Transactions recorded for listing promotion products</p></div><div className="table-scroll"><table className="admin-table"><thead><tr><th>Payment</th><th>Listing</th><th>Seller</th><th>Product</th><th>Amount</th><th>Date</th><th>Status</th><th/></tr></thead><tbody>{rows.map(row=>{const listing=listingById.get(row.listingId);const product=productById.get(row.promotionId);return <tr key={row.id}><td><div className="font-bold">{row.reference||row.id}</div><div className="text-[10px] text-slate-400">{row.id}</div></td><td>{listing?.title||row.listingId||"—"}</td><td>{row.seller}</td><td>{product?.name||row.promotionId||"Listing promotion"}</td><td className="font-semibold">{row.amount}</td><td>{row.date}</td><td><StatusBadge status={row.status}/></td><td><SafeLink href={`/payments/${row.id}`} className="text-xs font-bold text-emerald-700">View</SafeLink></td></tr>})}</tbody></table></div>{rows.length===0&&<div className="border-t border-slate-100 p-8 text-center text-xs text-slate-500">No promotion purchases have been recorded.</div>}</section>
  </div>;
}
function Promo({title,price,description,icon,duration}:{title:string;price:string;description:string;icon:ReactNode;duration:number}){return <article className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><strong className="text-lg font-black text-slate-950">{price}</strong></div><h2 className="mt-4 text-sm font-black text-slate-900">{title}</h2><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{description}</p><p className="mt-4 text-[11px] font-bold text-slate-400">{duration} day{duration===1?"":"s"}</p></article>}
