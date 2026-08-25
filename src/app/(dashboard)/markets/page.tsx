"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { useAdminData } from "@/components/admin/admin-data-provider";
import type { AdminMarketRecord, PlanRecord, PromotionProductRecord, PromotionMarketPriceRecord, SellerPlanMarketPriceRecord } from "@/types/admin";

const supportedMethods: Record<string, string[]> = {
  BR: ["pix", "card", "boleto"],
  GH: ["card", "mobile_money"],
  NG: ["card", "bank_transfer", "ussd"],
  KE: ["card", "mobile_money"],
  ZA: ["card", "eft"],
  CI: ["card", "mobile_money"],
};

const methodLabel = (value:string) => ({mobile_money:"Mobile Money",bank_transfer:"Bank transfer",ussd:"USSD",eft:"EFT",pix:"Pix",boleto:"Boleto",card:"Card"} as Record<string,string>)[value] || value.replace(/_/g," ");
const providerLabel = (value:string) => ({paystack:"Paystack",mercado_pago:"Mercado Pago",disabled:"Disabled",mock:"Mock / test"} as Record<string,string>)[value] || value.replace(/_/g," ");
const formatMoney = (value:number, market:AdminMarketRecord) => new Intl.NumberFormat(market.locale || "en", {style:"currency", currency:market.currency, maximumFractionDigits:market.currency==="XOF"?0:2}).format(value).replace(/\u00a0/g," ");

export default function MarketsPage(){
  const {markets,plans,promotionProducts,sellerPlanMarketPrices,promotionMarketPrices,sessionUser,updateMarket,setSellerPlanMarketPrice,setPromotionMarketPrice}=useAdminData();
  const [selected,setSelected]=useState<string>("");
  const [busy,setBusy]=useState<string>("");
  const activeCode=selected && markets.some(m=>m.code===selected) ? selected : markets.find(m=>m.isDefault)?.code || markets[0]?.code || "";
  const market=markets.find(m=>m.code===activeCode);
  const canConfigure=Boolean(sessionUser?.isSuperuser || ["super_admin","admin"].includes(sessionUser?.adminRole||""));

  async function changeMarket(code:string,input:Parameters<typeof updateMarket>[1],key:string){setBusy(key);try{await updateMarket(code,input);}finally{setBusy("");}}

  if(!markets.length) return <div className="space-y-6"><PageHeader title="Markets" description="Enable countries, choose the default market, and configure market-specific seller pricing."/><div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No market configuration is available. Apply the backend market migrations first.</div></div>;

  return <div className="space-y-6">
    <PageHeader title="Markets" description="Control country availability and configure prices per currency. Secrets remain in the server secret store."/>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {markets.map((item)=><button key={item.code} type="button" onClick={()=>setSelected(item.code)} className={`rounded-xl border p-4 text-left transition ${activeCode===item.code?"border-emerald-400 bg-emerald-50/40 shadow-sm":"border-slate-200 bg-white hover:border-slate-300"}`}>
        <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><strong className="text-sm text-slate-900">{item.countryName}</strong><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500">{item.code}</span></div><p className="mt-1 text-[11px] text-slate-500">{item.currency} · {item.locale} · {item.timezone}</p></div><div className="flex flex-col items-end gap-1">{item.isDefault&&<Badge tone="green">Default</Badge>}<Badge tone={item.isEnabled?"green":"gray"}>{item.isEnabled?"Enabled":"Disabled"}</Badge></div></div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px]"><span className="text-slate-500">{providerLabel(item.paymentProvider)}</span><span className={item.pricingReady?"font-bold text-emerald-700":"font-bold text-amber-700"}>{item.pricingReady?"Pricing ready":`${item.pricingIssues.length} pricing issue${item.pricingIssues.length===1?"":"s"}`}</span></div>
      </button>)}
    </div>

    {market&&<>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-slate-950">{market.countryName}</h2>{market.isDefault&&<Badge tone="green">Default marketplace</Badge>}</div><p className="mt-1 text-xs text-slate-500">{market.currencySymbol} · {market.currency} · {market.identityLabel} · {market.locationMode.replace(/_/g," ")}</p></div>{canConfigure&&<div className="flex flex-wrap gap-2">{!market.isDefault&&<AdminButton disabled={busy!==""} variant="outline" onClick={()=>void changeMarket(market.code,{isDefault:true},`default:${market.code}`)}>{busy===`default:${market.code}`?"Saving…":"Make default"}</AdminButton>}<AdminButton disabled={busy!=="" || (market.isDefault && market.isEnabled)} variant={market.isEnabled?"danger":"outline"} onClick={()=>void changeMarket(market.code,{isEnabled:!market.isEnabled},`enabled:${market.code}`)} title={market.isDefault&&market.isEnabled?"Choose another default market before disabling this one.":undefined}>{busy===`enabled:${market.code}`?"Saving…":market.isEnabled?"Disable market":"Enable market"}</AdminButton></div>}</div>

        <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-3">
          <div><Label>Payment provider</Label><select disabled={!canConfigure||busy!==""} value={market.paymentProvider} onChange={(e)=>void changeMarket(market.code,{paymentProvider:e.target.value},`provider:${market.code}`)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-500"><option value="disabled">Disabled</option><option value={market.code==="BR"?"mercado_pago":"paystack"}>{market.code==="BR"?"Mercado Pago":"Paystack"}</option><option value="mock">Mock / test</option></select></div>
          <div><Label>Seller identity</Label><div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><strong>{market.identityLabel}</strong><p className="mt-0.5 text-[10px] text-slate-500">Provider: {market.identityProvider||"disabled"}</p></div></div>
          <div><Label>Enabled payment methods</Label><div className="mt-2 flex min-h-10 flex-wrap gap-2">{(supportedMethods[market.code]||market.paymentMethods).map(method=>{const checked=market.paymentMethods.includes(method);return <label key={method} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-bold ${checked?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-slate-200 bg-white text-slate-500"}`}><input disabled={!canConfigure||busy!==""} type="checkbox" checked={checked} onChange={()=>{const next=checked?market.paymentMethods.filter(x=>x!==method):[...market.paymentMethods,method];void changeMarket(market.code,{paymentMethods:next},`methods:${market.code}`)}}/>{methodLabel(method)}</label>})}</div></div>
        </div>
        {!market.pricingReady&&market.pricingIssues.length>0&&<div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black text-amber-950">This market is not ready for paid seller services.</p><ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-900">{market.pricingIssues.map(issue=><li key={issue}>{issue}</li>)}</ul></div>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black">Seller plan pricing · {market.currency}</h2><p className="mt-1 text-xs text-slate-500">Prices apply only to sellers whose account market is {market.countryName}.</p></div>
        <div className="divide-y divide-slate-100">{plans.map(plan=>{const row=sellerPlanMarketPrices.find(r=>r.marketCode===market.code&&r.planId===plan.id);return <PlanPriceEditor key={`${market.code}:${plan.id}:${row?.monthlyPrice??""}:${row?.yearlyPrice??""}:${row?.active??""}`} market={market} plan={plan} row={row} onSave={setSellerPlanMarketPrice}/>})}</div>
        {plans.length===0&&<div className="p-6 text-xs text-slate-500">Create seller plans first, then return here to price them for each market.</div>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-black">Promotion pricing · {market.currency}</h2><p className="mt-1 text-xs text-slate-500">A promotion with no active market price will not be offered in {market.countryName}.</p></div>
        <div className="divide-y divide-slate-100">{promotionProducts.map(product=>{const row=promotionMarketPrices.find(r=>r.marketCode===market.code&&r.promotionId===product.id);return <PromotionPriceEditor key={`${market.code}:${product.id}:${row?.price??""}:${row?.active??""}`} market={market} product={product} row={row} onSave={setPromotionMarketPrice}/>})}</div>
        {promotionProducts.length===0&&<div className="p-6 text-xs text-slate-500">No promotion products are available yet.</div>}
      </section>
    </>}
  </div>;
}

function PlanPriceEditor({market,plan,row,onSave}:{market:AdminMarketRecord;plan:PlanRecord;row?:SellerPlanMarketPriceRecord;onSave:(input:{marketCode:string;planId:string;monthlyPrice:number;yearlyPrice:number;active:boolean})=>Promise<boolean>}){
  const [monthly,setMonthly]=useState(String(row?.monthlyPrice??0)); const [yearly,setYearly]=useState(String(row?.yearlyPrice??0)); const [active,setActive]=useState(row?.active??false); const [busy,setBusy]=useState(false);
  const preview=useMemo(()=>`${formatMoney(Number(monthly||0),market)} / month`,[monthly,market]);
  async function save(){setBusy(true);try{await onSave({marketCode:market.code,planId:plan.id,monthlyPrice:Number(monthly||0),yearlyPrice:Number(yearly||0),active});}finally{setBusy(false)}}
  return <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.3fr_1fr_1fr_auto_auto] lg:items-end"><div><p className="text-sm font-black text-slate-900">{plan.name}</p><p className="mt-1 text-[10px] text-slate-500">{preview} · {plan.listings} listings · {plan.featured} promotion credits</p></div><NumberField label="Monthly" value={monthly} onChange={setMonthly}/><NumberField label="Yearly" value={yearly} onChange={setYearly}/><label className="flex h-10 items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/> Offered</label><AdminButton disabled={busy} variant="outline" onClick={()=>void save()}>{busy?"Saving…":"Save"}</AdminButton></div>;
}

function PromotionPriceEditor({market,product,row,onSave}:{market:AdminMarketRecord;product:PromotionProductRecord;row?:PromotionMarketPriceRecord;onSave:(input:{marketCode:string;promotionId:string;price:number;active:boolean})=>Promise<boolean>}){
  const [price,setPrice]=useState(String(row?.price??0)); const [active,setActive]=useState(row?.active??false); const [busy,setBusy]=useState(false);
  async function save(){setBusy(true);try{await onSave({marketCode:market.code,promotionId:product.id,price:Number(price||0),active});}finally{setBusy(false)}}
  return <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.7fr_1fr_auto_auto] lg:items-end"><div><p className="text-sm font-black text-slate-900">{product.name}</p><p className="mt-1 text-[10px] text-slate-500">{product.description||`${product.durationDays} day promotion`} · {product.durationDays} day{product.durationDays===1?"":"s"}</p></div><NumberField label="Price" value={price} onChange={setPrice}/><label className="flex h-10 items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/> Offered</label><AdminButton disabled={busy} variant="outline" onClick={()=>void save()}>{busy?"Saving…":"Save"}</AdminButton></div>;
}

function NumberField({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</span><input type="number" min="0" step="0.01" value={value} onChange={e=>onChange(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"/></label>}
function Label({children}:{children:string}){return <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{children}</span>}
function Badge({children,tone}:{children:string;tone:"green"|"gray"}){return <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${tone==="green"?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{children}</span>}
