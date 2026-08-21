"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL, MarketliftApiError, apiRequest, graphqlRequest } from "@/lib/api-client";
import type {
  ActivityRecord, AdminListingRecord, AdminPaymentRecord, AdminReportRecord, AdminSellerRecord, AdminUserRecord,
  AdminVerificationRecord, CategoryRecord, ModerationRecord, PaymentSummary, PlanRecord, PromotionProductRecord,
  Status, SubscriptionRecord, SupportTicketRecord, VerificationSummary,
} from "@/types/admin";

type ToastTone = "success" | "danger" | "info";
type Toast = { id:number; title:string; description?:string; tone:ToastTone };
type SessionUser = { id:string; name:string; email:string; isStaff:boolean; isSuperuser:boolean; adminRole:string|null };
type SessionResponse = { authenticated:boolean; user:SessionUser|null };
type Decision = { action:string; status:string; at:string };

type AdminData = {
  users:AdminUserRecord[]; sellers:AdminSellerRecord[]; listings:AdminListingRecord[]; reports:AdminReportRecord[];
  verifications:AdminVerificationRecord[]; payments:AdminPaymentRecord[]; supportTickets:SupportTicketRecord[];
  categories:CategoryRecord[]; plans:PlanRecord[]; subscriptions:SubscriptionRecord[]; promotionProducts:PromotionProductRecord[];
  activityLog:ActivityRecord[]; moderationCases:ModerationRecord[]; paymentSummary:PaymentSummary; verificationSummary:VerificationSummary;
};

type ContextValue = AdminData & {
  sessionUser:SessionUser|null; loading:boolean; error:string|null; refresh:()=>Promise<void>;
  getStatus:(kind:string,id:string,fallback:string)=>string;
  setStatus:(kind:string,id:string,status:string,message?:string,reason?:string)=>Promise<boolean>;
  getDecision:(kind:string,id:string)=>Decision|undefined;
  commitDecision:(kind:string,id:string,action:string,status:string,message?:string,tone?:ToastTone,reason?:string)=>Promise<boolean>;
  isCategoryDeleted:(id:string)=>boolean;
  deleteCategory:(id:string,name:string,reason?:string)=>Promise<boolean>;
  saveSellerPlan:(input:{id?:string;name:string;monthlyPrice:number;yearlyPrice:number;listingLimit:number;promotionCredits:number;visibilityWeight:number;recommended:boolean;features:string[];active:boolean})=>Promise<boolean>;
  replySupportTicket:(id:string,message:string)=>Promise<boolean>;
  toast:(title:string,description?:string,tone?:ToastTone)=>void;
};

const emptySummary:PaymentSummary={paidTotal:0,refundedTotal:0,paidCount:0,failedCount:0,pendingCount:0,successRate:0};
const emptyVerificationSummary:VerificationSummary={pending:0,review:0,verifiedToday:0,rejectedToday:0};
const emptyData:AdminData={users:[],sellers:[],listings:[],reports:[],verifications:[],payments:[],supportTickets:[],categories:[],plans:[],subscriptions:[],promotionProducts:[],activityLog:[],moderationCases:[],paymentSummary:emptySummary,verificationSummary:emptyVerificationSummary};
const AdminDataContext=createContext<ContextValue|null>(null);

const titleCase=(value:string)=>value.replace(/_/g," ").replace(/\b\w/g,(c)=>c.toUpperCase());
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map((part)=>part[0]?.toUpperCase()).join("")||"ML";
const fmtDate=(value?:string|null)=>value?new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"—";
const fmtDay=(value?:string|null)=>value?new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(new Date(value)):"—";
const money=(value:number,currency="BRL")=>new Intl.NumberFormat("pt-BR",{style:"currency",currency}).format(value).replace(/\u00a0/g," ");
const locationText=(loc?:{city?:string;state?:string;stateCode?:string;district?:string|null})=>[loc?.district,loc?.city,loc?.stateCode||loc?.state].filter(Boolean).join(", ")||"—";
const mediaUrl=(value?:string|null)=>!value?"":/^https?:\/\//i.test(value)?value:`${API_BASE_URL}${value.startsWith("/")?value:`/${value}`}`;

function uiStatus(value?:string|null):Status {
  const key=(value||"").toLowerCase();
  const map:Record<string,Status>={active:"Active",published:"Active",verified:"Verified",pending:"Pending",under_review:"Review",review:"Review",rejected:"Rejected",removed:"Removed",resolved:"Resolved",dismissed:"Dismissed",open:"Open",paid:"Paid",failed:"Failed",refunded:"Refunded",expired:"Expired",draft:"Draft",paused:"Paused",sold:"Sold",suspended:"Suspended",cancelled:"Cancelled",closed:"Closed",past_due:"Past due",deleted:"Deleted"};
  return map[key]||titleCase(key||"pending") as Status;
}

async function safeQuery<T>(query:string, variables:Record<string,unknown>={}) {
  try { return await graphqlRequest<T>(query,variables); } catch (error) {
    if (error instanceof MarketliftApiError && [401,403].includes(error.status)) return null;
    console.error(error); return null;
  }
}

const USER_QUERY=`query AdminUsers { adminUsers(limit: 200) { id name email phone active staff suspended joinedAt location { state stateCode city district } sellerId adminRole } }`;
const SELLER_QUERY=`query AdminSellers { adminSellers(limit: 100) { id userId name email sellerType verified suspended activatedAt suspendedAt suspensionReason listingCount } }`;
const BILLING_QUERY=`query AdminSellerBilling { adminSubscriptions(limit: 100) { id sellerId sellerName billingCycle status currentPeriodEnd promotionCreditsRemaining plan { id name monthlyPrice yearlyPrice listingLimit promotionCredits features visibilityWeight recommended active sortOrder } } adminSellerPlans { id name monthlyPrice yearlyPrice listingLimit promotionCredits features visibilityWeight recommended active sortOrder } }`;
const LISTING_QUERY=`query AdminListings { adminListings(limit: 200) { id slug title description price category categoryName condition location { state stateCode city district } images seller { id name avatarUrl verified sellerType isSuspended rating reviews activeListings memberSince location { state stateCode city district } } createdAt status sellerDeletedAt views favorites inquiries featured urgent } moderationQueue(includeFinal: true, limit: 100) { id status source reviewReason decisionReason openedAt decidedAt decidedBy listing { id } } }`;
const REPORT_QUERY=`query AdminReports { reports(limit: 100) { id reference targetType targetId targetLabel reason statement priority status reporterName assignedTo internalNote decisionReason createdAt decidedAt } }`;
const VERIFICATION_QUERY=`query AdminVerifications { verifications(limit: 100) { id sellerId sellerName cpfMasked legalName birthDate documentType documentFrontUrl documentBackUrl selfieUrl status riskLevel riskFlags submittedAt decisionNote } verificationQueueSummary { pending review verifiedToday rejectedToday } }`;
const PAYMENT_QUERY=`query AdminPayments { adminPayments(limit: 100) { id reference sellerId sellerName purpose method status amount currency provider providerOrderId planId billingCycle listingId promotionId createdAt } paymentSummary { paidTotal refundedTotal paidCount failedCount pendingCount successRate } }`;
const SUPPORT_QUERY=`query AdminSupport { supportTickets(limit: 200) { id reference userId userName subject category priority status assignedTo updatedAt createdAt } }`;
const CATEGORY_QUERY=`query AdminCategories { adminCategories { id name icon active subcategories { id name icon active } } }`;
const AUDIT_QUERY=`query AdminAudit { auditEvents(limit: 200) { id actorName actorEmail action targetType targetId targetLabel ipAddress createdAt } }`;
const PROMOTION_QUERY=`query PromotionOptions { promotionOptions { id name description durationDays price } }`;

export function AdminDataProvider({children}:{children:ReactNode}) {
  const router=useRouter(); const pathname=usePathname();
  const [data,setData]=useState<AdminData>(emptyData); const [sessionUser,setSessionUser]=useState<SessionUser|null>(null);
  const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null); const [toasts,setToasts]=useState<Toast[]>([]);

  const toast=useCallback((title:string,description?:string,tone:ToastTone="success")=>{
    const id=Date.now()+Math.floor(Math.random()*1000); setToasts((current)=>[...current,{id,title,description,tone}]);
    window.setTimeout(()=>setToasts((current)=>current.filter((item)=>item.id!==id)),3600);
  },[]);

  const refresh=useCallback(async()=>{
    setLoading(true); setError(null);
    try {
      const session=await apiRequest<SessionResponse>("/api/v1/auth/session/");
      if (!session.authenticated || !session.user?.isStaff) { setSessionUser(null); router.replace(`/login?next=${encodeURIComponent(pathname||"/dashboard")}`); return; }
      setSessionUser(session.user);
      const [usersRes,sellerRes,billingRes,listingRes,reportRes,verificationRes,paymentRes,supportRes,categoryRes,auditRes,promotionRes]=await Promise.all([
        safeQuery<any>(USER_QUERY), safeQuery<any>(SELLER_QUERY), safeQuery<any>(BILLING_QUERY), safeQuery<any>(LISTING_QUERY), safeQuery<any>(REPORT_QUERY), safeQuery<any>(VERIFICATION_QUERY),
        safeQuery<any>(PAYMENT_QUERY), safeQuery<any>(SUPPORT_QUERY), safeQuery<any>(CATEGORY_QUERY), safeQuery<any>(AUDIT_QUERY), safeQuery<any>(PROMOTION_QUERY),
      ]);
      const rawUsers=usersRes?.adminUsers||[]; const rawSubs=billingRes?.adminSubscriptions||[]; const rawListings=listingRes?.adminListings||[]; const rawReports=reportRes?.reports||[];
      const subscriptions:SubscriptionRecord[]=rawSubs.map((s:any)=>({id:s.id,sellerId:s.sellerId,sellerName:s.sellerName,planName:s.plan.name,billingCycle:titleCase(s.billingCycle),status:uiStatus(s.status),periodEnd:fmtDate(s.currentPeriodEnd),promotionCreditsRemaining:s.promotionCreditsRemaining}));
      const subBySeller=new Map(rawSubs.map((s:any)=>[s.sellerId,s]));
      const userById=new Map(rawUsers.map((u:any)=>[u.id,u]));
      const users:AdminUserRecord[]=rawUsers.map((u:any)=>({id:u.id,name:u.name,email:u.email,phone:u.phone||"—",type:u.staff?"Administrator":u.sellerId?"Buyer & Seller":"Buyer",status:u.suspended?"Suspended":u.active?"Active":"Pending",joined:fmtDay(u.joinedAt),location:locationText(u.location),avatar:initials(u.name),sellerId:u.sellerId||null,adminRole:u.adminRole||null}));
      const sellers:AdminSellerRecord[]=(sellerRes?.adminSellers||[]).map((s:any)=>{const u=userById.get(s.userId) as any; const sub=subBySeller.get(s.id) as any; return {id:s.id,publicSellerId:s.id,userId:s.userId,name:s.name,owner:u?.name||s.email,plan:sub?.plan?.name||"Free",status:s.suspended?"Suspended":s.verified?"Verified":"Pending",listings:s.listingCount,rating:"—",revenue:"—",location:locationText(u?.location),joined:fmtDay(s.activatedAt),avatar:""};});
      const reports:AdminReportRecord[]=rawReports.map((r:any)=>({id:r.id,reference:r.reference,type:titleCase(r.targetType),target:r.targetLabel||r.targetId,targetId:r.targetId,reporter:r.reporterName||"—",status:uiStatus(r.status),created:fmtDate(r.createdAt),priority:titleCase(r.priority),reason:titleCase(r.reason),statement:r.statement||"",assignedTo:r.assignedTo||"—",internalNote:r.internalNote||"",decisionReason:r.decisionReason||""}));
      const reportCountByListing=new Map<string,number>(); rawReports.filter((r:any)=>r.targetType==="listing").forEach((r:any)=>reportCountByListing.set(r.targetId,(reportCountByListing.get(r.targetId)||0)+1));
      const listings:AdminListingRecord[]=rawListings.map((l:any)=>({id:l.id,publicId:l.id,publicSlug:l.slug,publicSellerId:l.seller.id,title:l.title,seller:l.seller.name,category:l.categoryName,categorySlug:l.category,price:l.price==null?"Contact seller":money(Number(l.price)),priceValue:l.price==null?null:Number(l.price),images:(l.images||[]).map(mediaUrl),image:mediaUrl(l.images?.[0]),description:l.description,condition:l.condition||"—",location:locationText(l.location),status:l.sellerDeletedAt?"Deleted":uiStatus(l.status),rawStatus:l.status,sellerDeletedAt:l.sellerDeletedAt||"",created:fmtDate(l.createdAt),reports:reportCountByListing.get(l.id)||0,views:l.views||0,favorites:l.favorites||0,inquiries:l.inquiries||0,featured:Boolean(l.featured),urgent:Boolean(l.urgent)}));
      const listingCounts=new Map<string,number>(); rawListings.forEach((l:any)=>listingCounts.set(l.category,(listingCounts.get(l.category)||0)+1));
      const categories:CategoryRecord[]=(categoryRes?.adminCategories||[]).map((c:any)=>({id:c.id,name:c.name,slug:c.id,listings:listingCounts.get(c.id)||0,active:Boolean(c.active),icon:c.icon||"",subcategories:c.subcategories||[]}));
      const verifications:AdminVerificationRecord[]=(verificationRes?.verifications||[]).map((v:any)=>({id:v.id,sellerId:v.sellerId,seller:v.sellerName,owner:v.legalName||v.sellerName,document:v.documentType?titleCase(v.documentType):"Not provided",submitted:fmtDate(v.submittedAt),status:uiStatus(v.status),risk:titleCase(v.riskLevel),cpfMasked:v.cpfMasked,legalName:v.legalName,birthDate:v.birthDate,documentFrontUrl:mediaUrl(v.documentFrontUrl),documentBackUrl:mediaUrl(v.documentBackUrl),selfieUrl:mediaUrl(v.selfieUrl),flags:v.riskFlags||[],decisionNote:v.decisionNote||""}));
      const payments:AdminPaymentRecord[]=(paymentRes?.adminPayments||[]).map((p:any)=>({id:p.id,reference:p.reference,sellerId:p.sellerId,seller:p.sellerName,type:p.purpose==="subscription"?"Seller subscription":"Listing promotion",purpose:titleCase(p.purpose),method:p.method==="pix"?"Pix":p.method==="card"?"Credit card":titleCase(p.method),status:uiStatus(p.status),amount:money(Number(p.amount),p.currency||"BRL"),amountValue:Number(p.amount),date:fmtDate(p.createdAt),provider:p.provider,providerOrderId:p.providerOrderId||"—",planId:p.planId||"",listingId:p.listingId||"",promotionId:p.promotionId||""}));
      const supportTickets:SupportTicketRecord[]=(supportRes?.supportTickets||[]).map((t:any)=>({id:t.id,reference:t.reference,user:t.userName,subject:t.subject,category:titleCase(t.category),priority:titleCase(t.priority),status:uiStatus(t.status),updated:fmtDate(t.updatedAt),assignedTo:t.assignedTo||"—"}));
      const plans:PlanRecord[]=(billingRes?.adminSellerPlans||[]).map((p:any)=>({id:p.id,name:p.name,price:money(Number(p.monthlyPrice)),priceValue:Number(p.monthlyPrice),yearlyPrice:money(Number(p.yearlyPrice)),yearlyPriceValue:Number(p.yearlyPrice),period:"/month",sellers:rawSubs.filter((s:any)=>s.plan.id===p.id&&s.status==="active").length,listings:p.listingLimit,featured:p.promotionCredits,badge:p.recommended?"Recommended":"",active:Boolean(p.active),visibilityWeight:Number(p.visibilityWeight),recommended:Boolean(p.recommended),features:p.features||[]}));
      const activityLog:ActivityRecord[]=(auditRes?.auditEvents||[]).map((a:any)=>({id:a.id,admin:a.actorName||"System",action:titleCase(String(a.action).replace(/[.]/g," ")),target:a.targetLabel||`${a.targetType} ${a.targetId}`,time:fmtDate(a.createdAt),ip:a.ipAddress||"—",targetType:a.targetType,targetId:a.targetId}));
      const promotionProducts:PromotionProductRecord[]=(promotionRes?.promotionOptions||[]).map((p:any)=>({id:p.id,name:p.name,description:p.description,durationDays:p.durationDays,price:money(Number(p.price)),priceValue:Number(p.price)}));
      const moderationCases:ModerationRecord[]=(listingRes?.moderationQueue||[]).map((m:any)=>({id:m.id,status:m.status,source:m.source,reviewReason:m.reviewReason,decisionReason:m.decisionReason||"",openedAt:fmtDate(m.openedAt),decidedAt:fmtDate(m.decidedAt),decidedBy:m.decidedBy||"",listingId:m.listing.id}));
      setData({users,sellers,listings,reports,verifications,payments,supportTickets,categories,plans,subscriptions,promotionProducts,activityLog,moderationCases,paymentSummary:paymentRes?.paymentSummary||emptySummary,verificationSummary:verificationRes?.verificationQueueSummary||emptyVerificationSummary});
    } catch (e) {
      if (e instanceof MarketliftApiError && [401,403].includes(e.status)) router.replace("/login");
      else setError(e instanceof Error?e.message:"Could not load administration data.");
    } finally { setLoading(false); }
  },[pathname,router]);

  useEffect(()=>{void refresh();},[refresh]);

  const mutate=useCallback(async<T,>(query:string,variables:Record<string,unknown>)=>{const result=await graphqlRequest<T>(query,variables); await refresh(); return result;},[refresh]);

  const setStatus=useCallback(async(kind:string,id:string,status:string,message?:string,reason="Administrative action")=>{
    try {
      const safeReason=reason.trim()||"Administrative action";
      if(kind==="user") await mutate(status==="Suspended"?`mutation($id:ID!,$reason:String!){suspendAccount(userId:$id,reason:$reason){id}}`:`mutation($id:ID!,$reason:String!){reactivateAccount(userId:$id,reason:$reason){id}}`,{id,reason:safeReason});
      else if(kind==="seller") await mutate(status==="Suspended"?`mutation($id:ID!,$reason:String!){suspendSeller(sellerId:$id,reason:$reason){id}}`:`mutation($id:ID!,$reason:String!){restoreSeller(sellerId:$id,reason:$reason){id}}`,{id,reason:safeReason});
      else if(kind==="listing"&&status==="Review") await mutate(`mutation($id:ID!,$reason:String!){moveListingToReview(listingId:$id,reason:$reason){id}}`,{id,reason:safeReason});
      else if(kind==="report"&&status==="Review") await mutate(`mutation($id:ID!,$note:String!){moveReportToReview(reportId:$id,note:$note){id}}`,{id,note:safeReason});
      else if(kind==="verification"&&status==="Review") await mutate(`mutation($id:ID!,$note:String!){moveVerificationToReview(id:$id,note:$note){id}}`,{id,note:safeReason});
      else if(kind==="ticket") await mutate(`mutation($id:ID!,$status:String!){adminUpdateSupportTicket(ticketId:$id,status:$status){id}}`,{id,status:status.toLowerCase().replace(/ /g,"_")});
      else throw new Error(`Unsupported ${kind} status transition.`);
      toast(message||`${id} updated`, `Status changed to ${status}.`); return true;
    } catch(e){toast("Action failed",e instanceof Error?e.message:"The action could not be completed.","danger");return false;}
  },[mutate,toast]);

  const commitDecision=useCallback(async(kind:string,id:string,action:string,status:string,message?:string,tone:ToastTone="success",reason="Administrative decision")=>{
    try {
      const safeReason=reason.trim()||"Administrative decision";
      if(kind==="listing") {
        if(action==="Approved") await mutate(`mutation($id:ID!,$reason:String!){approveListing(listingId:$id,reason:$reason){id}}`,{id,reason:safeReason});
        else if(action==="Rejected") await mutate(`mutation($id:ID!,$reason:String!){rejectListing(listingId:$id,reason:$reason){id}}`,{id,reason:safeReason});
        else if(action==="Removed") await mutate(`mutation($id:ID!,$reason:String!){removeListing(listingId:$id,reason:$reason){id}}`,{id,reason:safeReason});
      } else if(kind==="verification") {
        if(action==="Approved") await mutate(`mutation($id:ID!,$note:String!){approveVerification(id:$id,note:$note){id}}`,{id,note:safeReason});
        else await mutate(`mutation($id:ID!,$note:String!){rejectVerification(id:$id,note:$note){id}}`,{id,note:safeReason});
      } else if(kind==="report") {
        if(action==="Resolved") await mutate(`mutation($id:ID!,$reason:String!){resolveReport(reportId:$id,reason:$reason){id}}`,{id,reason:safeReason});
        else await mutate(`mutation($id:ID!,$reason:String!){dismissReport(reportId:$id,reason:$reason){id}}`,{id,reason:safeReason});
      } else throw new Error(`Unsupported ${kind} decision.`);
      toast(message||`${id} ${action.toLowerCase()}`,`Final status: ${status}.`,tone); return true;
    } catch(e){toast("Action failed",e instanceof Error?e.message:"The decision could not be saved.","danger");return false;}
  },[mutate,toast]);

  const getStatus=useCallback((kind:string,id:string,fallback:string)=>{
    const collections:Record<string,{id:string;status?:string}[]>={user:data.users,seller:data.sellers,listing:data.listings,report:data.reports,verification:data.verifications,ticket:data.supportTickets,payment:data.payments};
    return collections[kind]?.find((item)=>item.id===id)?.status||fallback;
  },[data]);
  const getDecision=useCallback((kind:string,id:string):Decision|undefined=>{
    if(kind==="listing") { const c=data.moderationCases.find((m)=>m.listingId===id); if(c&&["approved","rejected"].includes(c.status)) return {action:titleCase(c.status),status:c.status==="approved"?"Active":"Rejected",at:c.decidedAt}; }
    if(kind==="verification") { const v=data.verifications.find((x)=>x.id===id); if(v&&["Verified","Rejected"].includes(v.status)) return {action:v.status==="Verified"?"Approved":"Rejected",status:v.status,at:v.submitted}; }
    if(kind==="report") { const r=data.reports.find((x)=>x.id===id); if(r&&["Resolved","Dismissed"].includes(r.status)) return {action:r.status,status:r.status,at:r.created}; }
    return undefined;
  },[data]);
  const deleteCategory=useCallback(async(id:string,name:string)=>{try{await mutate(`mutation($id:String!){deleteCategory(categoryId:$id){slug affectedListings}}`,{id});toast("Category deleted",`${name} was permanently removed from the catalog.`,"danger");return true;}catch(e){toast("Category could not be deleted",e instanceof Error?e.message:undefined,"danger");return false;}},[mutate,toast]);


  const saveSellerPlan=useCallback(async(input:{id?:string;name:string;monthlyPrice:number;yearlyPrice:number;listingLimit:number;promotionCredits:number;visibilityWeight:number;recommended:boolean;features:string[];active:boolean})=>{
    try {
      if(input.id) await mutate(`mutation($id:String!,$name:String!,$monthlyPrice:Float!,$yearlyPrice:Float!,$listingLimit:Int!,$promotionCredits:Int!,$visibilityWeight:Float!,$recommended:Boolean!,$features:[String!]!,$active:Boolean!){updateSellerPlan(id:$id,name:$name,monthlyPrice:$monthlyPrice,yearlyPrice:$yearlyPrice,listingLimit:$listingLimit,promotionCredits:$promotionCredits,visibilityWeight:$visibilityWeight,recommended:$recommended,features:$features,active:$active){id}}`,input);
      else await mutate(`mutation($name:String!,$monthlyPrice:Float!,$yearlyPrice:Float!,$listingLimit:Int!,$promotionCredits:Int!,$visibilityWeight:Float!,$recommended:Boolean!,$features:[String!],$active:Boolean!){createSellerPlan(name:$name,monthlyPrice:$monthlyPrice,yearlyPrice:$yearlyPrice,listingLimit:$listingLimit,promotionCredits:$promotionCredits,visibilityWeight:$visibilityWeight,recommended:$recommended,features:$features,active:$active){id}}`,input);
      toast(input.id?"Plan updated":"Plan created",`${input.name} is now saved in the seller plan catalog.`); return true;
    } catch(e){toast("Plan could not be saved",e instanceof Error?e.message:undefined,"danger");return false;}
  },[mutate,toast]);

  const replySupportTicket=useCallback(async(id:string,message:string)=>{
    try { await mutate(`mutation($id:ID!,$message:String!){adminReplySupportTicket(ticketId:$id,message:$message,status:"review"){id}}`,{id,message}); toast("Reply sent",`Ticket ${id} was updated.`); return true; }
    catch(e){toast("Reply could not be sent",e instanceof Error?e.message:undefined,"danger");return false;}
  },[mutate,toast]);

  const value=useMemo<ContextValue>(()=>({...data,sessionUser,loading,error,refresh,getStatus,setStatus,getDecision,commitDecision,isCategoryDeleted:(id)=>!data.categories.some((c)=>c.id===id),deleteCategory,saveSellerPlan,replySupportTicket,toast}),[data,sessionUser,loading,error,refresh,getStatus,setStatus,getDecision,commitDecision,deleteCategory,saveSellerPlan,replySupportTicket,toast]);
  return <AdminDataContext.Provider value={value}>{children}<div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">{toasts.map((item)=><div key={item.id} className={`pointer-events-auto rounded-xl border bg-white p-4 shadow-2xl shadow-slate-950/10 ${item.tone==="danger"?"border-red-200":item.tone==="info"?"border-blue-200":"border-emerald-200"}`}><div className="flex items-start gap-3"><span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-black ${item.tone==="danger"?"bg-red-50 text-red-700":item.tone==="info"?"bg-blue-50 text-blue-700":"bg-emerald-50 text-emerald-700"}`}>{item.tone==="danger"?"!":item.tone==="info"?"i":"✓"}</span><div><p className="text-sm font-black text-slate-900">{item.title}</p>{item.description&&<p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>}</div></div></div>)}</div></AdminDataContext.Provider>;
}

export function useAdminData(){const value=useContext(AdminDataContext);if(!value)throw new Error("useAdminData must be used within AdminDataProvider");return value;}
