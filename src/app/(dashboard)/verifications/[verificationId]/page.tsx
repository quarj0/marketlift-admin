"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SafeLink } from "@/components/ui/safe-link";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions } from "@/components/admin/entity-actions";
import { MarketplaceImage } from "@/components/admin/marketplace-image";
import { graphqlRequest } from "@/lib/api-client";
import { useAdminData } from "@/components/admin/admin-data-provider";
import type { Status } from "@/types/admin";

type Verification={id:string;sellerId:string;sellerName:string;cpfMasked:string;legalName:string;birthDate:string;documentType:string|null;documentFrontUrl:string|null;documentBackUrl:string|null;selfieUrl:string|null;status:string;riskLevel:string;riskFlags:string[];automatedChecks:Record<string,unknown>;providerResult:string|null;submittedAt:string;reviewStartedAt:string|null;decidedAt:string|null;decisionNote:string|null};
const QUERY=`query AdminVerificationDetail($id:ID!){verification(id:$id){id sellerId sellerName cpfMasked legalName birthDate documentType documentFrontUrl documentBackUrl selfieUrl status riskLevel riskFlags automatedChecks providerResult submittedAt reviewStartedAt decidedAt decisionNote}}`;
const fmt=(v:string)=>new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v));
const title=(v?:string|null)=>v?v.replace(/_/g," ").replace(/\b\w/g,(c)=>c.toUpperCase()):"—";
const uiStatus=(v:string):Status=>({verified:"Verified",pending:"Pending",review:"Review",rejected:"Rejected"}[v]||title(v)) as Status;

export default function VerificationDetailPage(){
  const {verificationId}=useParams<{verificationId:string}>(); const {toast}=useAdminData(); const [v,setVerification]=useState<Verification|null>(null); const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{setLoading(true);try{const d=await graphqlRequest<{verification:Verification|null}>(QUERY,{id:verificationId});setVerification(d.verification);}catch(e){toast("Verification unavailable",e instanceof Error?e.message:undefined,"danger");}finally{setLoading(false)}},[verificationId,toast]);
  useEffect(()=>{const timeoutId=window.setTimeout(()=>{void load()},0);return()=>window.clearTimeout(timeoutId)},[load]);
  if(loading)return <div className="rounded-xl border bg-white p-8 text-sm text-slate-500">Loading verification…</div>;
  if(!v)return <div className="rounded-xl border bg-white p-8 text-center"><h1 className="text-lg font-black">Verification not found</h1><SafeLink href="/verifications" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Back to verifications</SafeLink></div>;
  const status=uiStatus(v.status);
  return <div className="space-y-6"><SafeLink href="/verifications" className="text-xs font-bold text-slate-500">← Back to verifications</SafeLink>
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h1 className="text-xl font-black">{v.sellerName}</h1><LiveStatusBadge kind="verification" id={v.id} status={status}/></div><p className="mt-1 text-xs text-slate-500">{v.id} · submitted {fmt(v.submittedAt)}</p></div><EntityActions kind="verification" id={v.id} name={v.sellerName} status={status}/></div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black">Identity information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Row label="Legal name" value={v.legalName}/><Row label="CPF" value={v.cpfMasked}/><Row label="Date of birth" value={new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(new Date(`${v.birthDate}T00:00:00`))}/><Row label="Document" value={title(v.documentType)}/><Row label="Risk level" value={title(v.riskLevel)}/><Row label="Seller ID" value={v.sellerId}/><Row label="Review started" value={v.reviewStartedAt?fmt(v.reviewStartedAt):"—"}/><Row label="Decision time" value={v.decidedAt?fmt(v.decidedAt):"—"}/><Row label="Provider result" value={v.providerResult||"—"}/></div>{v.riskFlags.length>0&&<div className="mt-5"><p className="text-[10px] font-bold uppercase text-slate-400">Risk flags</p><div className="mt-2 flex flex-wrap gap-2">{v.riskFlags.map((flag)=><span key={flag} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{title(flag)}</span>)}</div></div>}{v.decisionNote&&<div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Decision note</p><p className="mt-2 text-sm text-slate-700">{v.decisionNote}</p></div>}</section><aside className="space-y-5"><Media label="Document front" src={v.documentFrontUrl}/><Media label="Document back" src={v.documentBackUrl}/><Media label="Selfie" src={v.selfieUrl}/></aside></div>
  </div>;
}
function Row({label,value}:{label:string;value:string}){return <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-xs font-semibold text-slate-800">{value||"—"}</p></div>}
function Media({label,src}:{label:string;src:string|null}){return <section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-xs font-black text-slate-700">{label}</h2>{src?<MarketplaceImage src={src} alt={label} className="mt-3 max-h-72 w-full rounded-lg object-contain" fallbackClassName="mt-3 h-40 w-full rounded-lg"/>:<p className="mt-3 text-xs text-slate-500">Not provided</p>}</section>}
