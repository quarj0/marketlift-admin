"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SafeLink } from "@/components/ui/safe-link";
import { StatusBadge } from "@/components/ui/status-badge";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions } from "@/components/admin/entity-actions";
import { MarketplaceImage } from "@/components/admin/marketplace-image";
import { PublicSellerLink } from "@/components/admin/public-marketplace-link";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { graphqlRequest } from "@/lib/api-client";
import { Icons } from "@/lib/icons";
import { releaseFeatures } from "@/lib/release-features";

type Seller={id:string;userId:string;name:string;email:string;sellerType:string;verified:boolean;suspended:boolean;activatedAt:string;suspendedAt:string|null;suspensionReason:string|null;listingCount:number};
type User={id:string;name:string;location:{state:string;stateCode:string;city:string;district:string|null}};
const SELLER_QUERY=`query AdminSellerDetail($id:ID!){adminSeller(id:$id){id userId name email sellerType verified suspended activatedAt suspendedAt suspensionReason listingCount}}`;
const USER_QUERY=`query AdminSellerOwner($id:ID!){adminUser(id:$id){id name location{state stateCode city district}}}`;
const fmt=(value?:string|null)=>value?new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"—";
const location=(u:User|null)=>u?[u.location.district,u.location.city,u.location.stateCode||u.location.state].filter(Boolean).join(", ")||"—":"—";

export default function SellerPage(){
  const {sellerId}=useParams<{sellerId:string}>(); const {toast,listings,subscriptions}=useAdminData(); const [seller,setSeller]=useState<Seller|null>(null); const [owner,setOwner]=useState<User|null>(null); const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{setLoading(true);try{const d=await graphqlRequest<{adminSeller:Seller|null}>(SELLER_QUERY,{id:sellerId});setSeller(d.adminSeller);if(d.adminSeller){const u=await graphqlRequest<{adminUser:User|null}>(USER_QUERY,{id:d.adminSeller.userId});setOwner(u.adminUser);}}catch(e){toast("Seller unavailable",e instanceof Error?e.message:undefined,"danger");}finally{setLoading(false)}},[sellerId,toast]);
  useEffect(()=>{const timeoutId=window.setTimeout(()=>{void load()},0);return()=>window.clearTimeout(timeoutId)},[load]);
  if(loading)return <div className="rounded-xl border bg-white p-8 text-sm text-slate-500">Loading seller…</div>;
  if(!seller)return <div className="rounded-xl border bg-white p-8 text-center"><h1 className="text-lg font-black">Seller unavailable</h1><SafeLink href="/sellers" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Back to sellers</SafeLink></div>;
  const status=seller.suspended?"Suspended":releaseFeatures.cpfVerification&&seller.verified?"Verified":"Active"; const sellerListings=listings.filter((x)=>x.publicSellerId===seller.id); const subscription=subscriptions.find((x)=>x.sellerId===seller.id);
  return <div className="space-y-6"><SafeLink href="/sellers" className="text-xs font-bold text-slate-500">← Back to sellers</SafeLink>
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><MarketplaceImage src="" alt={`${seller.name} profile image`} className="size-12 rounded-full border object-cover" fallbackClassName="size-12 rounded-full border"/><div><div className="flex items-center gap-2"><h1 className="text-xl font-black">{seller.name}</h1><LiveStatusBadge kind="seller" id={seller.id} status={status}/></div><p className="mt-1 text-xs text-slate-500">{seller.email} · {seller.id} · {location(owner)}</p></div></div><div className="flex flex-wrap gap-2"><PublicSellerLink sellerId={seller.id} sellerName={seller.name}/><EntityActions kind="seller" id={seller.id} name={seller.name} status={status}/></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Current plan",subscription?.planName||"—"],["Listings",String(seller.listingCount)],["Seller type",seller.sellerType.replace(/_/g," ")],["Status",status]].map(([label,value])=><div className="rounded-xl border border-slate-200 bg-white p-4" key={label}><p className="text-xs text-slate-500">{label}</p><strong className="mt-2 block text-xl font-black capitalize">{value}</strong></div>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]"><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="px-5 py-4"><h2 className="text-sm font-black">Loaded seller listings</h2><p className="mt-0.5 text-xs text-slate-500">Listings currently loaded in this administration session.</p></div><div className="table-scroll"><table className="admin-table"><thead><tr><th>Listing</th><th>Price</th><th>Status</th><th/></tr></thead><tbody>{sellerListings.map((listing)=><tr key={listing.id}><td><div className="flex items-center gap-3"><MarketplaceImage src={listing.image} alt="" className="size-10 rounded-lg object-cover" fallbackClassName="size-10 rounded-lg"/><div><div className="font-bold">{listing.title}</div><div className="text-[10px] text-slate-400">{listing.id}</div></div></div></td><td>{listing.price}</td><td><StatusBadge status={listing.status}/></td><td><SafeLink href={`/listings/${listing.id}`} className="text-emerald-700"><Icons.chevronRight size={16}/></SafeLink></td></tr>)}{sellerListings.length===0&&<tr><td colSpan={4} className="py-8 text-center text-sm text-slate-500">No seller listings are loaded. The seller has {seller.listingCount.toLocaleString("pt-BR")} listing record{seller.listingCount===1?"":"s"} in total.</td></tr>}</tbody></table></div></section>
      <aside className="space-y-6"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black">Seller details</h2><div className="mt-4 space-y-4 text-xs"><Row label="Account" value={owner?.name||seller.email}/><Row label="Activated" value={fmt(seller.activatedAt)}/><Row label="Location" value={location(owner)}/><Row label="Verification" value={seller.verified?"Verified":"Not verified"}/><Row label="Seller ID" value={seller.id}/>{seller.suspendedAt&&<Row label="Suspended" value={fmt(seller.suspendedAt)}/>}</div>{seller.suspensionReason&&<div className="mt-4 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800">{seller.suspensionReason}</div>}</section><section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-black"><Icons.shield size={17} className="text-emerald-600"/>Trust & safety</div><p className="mt-3 text-xs leading-5 text-slate-500">Review reports and enforcement history before changing seller access.</p></section></aside>
    </div>
  </div>;
}
function Row({label,value}:{label:string;value:string}){return <div className="flex justify-between gap-3"><span className="text-slate-500">{label}</span><strong className="max-w-[65%] break-words text-right text-slate-800">{value}</strong></div>}
