"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL, MarketliftApiError, apiRequest, graphqlRequest } from "@/lib/api-client";
import { canAccessAdminArea, type AdminArea } from "@/lib/admin-access";
import { releaseFeatures } from "@/lib/release-features";
import type {
  ActivityRecord, AdminDashboardRecord, AdminListingRecord, AdminNotificationRecord, AdminPaymentRecord, AdminReportRecord,
  AdminSellerRecord, AdminUserRecord, AdminVerificationRecord, CategoryRecord, ModerationRecord, PaymentSummary, PlanRecord,
  PromotionProductRecord, Status, SubscriptionRecord, SupportTicketRecord, VerificationSummary, AdminMarketRecord,
  SellerPlanMarketPriceRecord, PromotionMarketPriceRecord,
} from "@/types/admin";

type ToastTone = "success" | "danger" | "info";
type Toast = { id:number; title:string; description?:string; tone:ToastTone };
export type SessionUser = { id:string; name:string; email:string; isStaff:boolean; isSuperuser:boolean; adminRole:string|null };
type SessionResponse = { authenticated:boolean; user:SessionUser|null };
type Decision = { action:string; status:string; at:string };

type AdminData = {
  users:AdminUserRecord[]; sellers:AdminSellerRecord[]; listings:AdminListingRecord[]; reports:AdminReportRecord[];
  verifications:AdminVerificationRecord[]; payments:AdminPaymentRecord[]; supportTickets:SupportTicketRecord[];
  categories:CategoryRecord[]; plans:PlanRecord[]; subscriptions:SubscriptionRecord[]; promotionProducts:PromotionProductRecord[];
  activityLog:ActivityRecord[]; moderationCases:ModerationRecord[]; paymentSummary:PaymentSummary; verificationSummary:VerificationSummary;
  dashboard:AdminDashboardRecord; notifications:AdminNotificationRecord[]; unreadNotificationCount:number;
  markets:AdminMarketRecord[]; sellerPlanMarketPrices:SellerPlanMarketPriceRecord[]; promotionMarketPrices:PromotionMarketPriceRecord[];
};

type ContextValue = AdminData & {
  sessionUser:SessionUser|null; loading:boolean; error:string|null; refresh:()=>Promise<void>; canAccess:(area:AdminArea)=>boolean;
  getStatus:(kind:string,id:string,fallback:string)=>string;
  setStatus:(kind:string,id:string,status:string,message?:string,reason?:string)=>Promise<boolean>;
  getDecision:(kind:string,id:string)=>Decision|undefined;
  commitDecision:(kind:string,id:string,action:string,status:string,message?:string,tone?:ToastTone,reason?:string)=>Promise<boolean>;
  isCategoryDeleted:(id:string)=>boolean;
  deleteCategory:(id:string,name:string)=>Promise<boolean>;
  saveSellerPlan:(input:{id?:string;name:string;monthlyPrice:number;yearlyPrice:number;listingLimit:number;promotionCredits:number;visibilityWeight:number;recommended:boolean;features:string[];active:boolean})=>Promise<boolean>;
  updateMarket:(code:string,input:{isEnabled?:boolean;isDefault?:boolean;paymentProvider?:string;paymentMethods?:string[];identityProvider?:string;sortOrder?:number})=>Promise<boolean>;
  setSellerPlanMarketPrice:(input:{marketCode:string;planId:string;monthlyPrice:number;yearlyPrice:number;active:boolean})=>Promise<boolean>;
  setPromotionMarketPrice:(input:{marketCode:string;promotionId:string;price:number;active:boolean})=>Promise<boolean>;
  replySupportTicket:(id:string,message:string)=>Promise<boolean>;
  markNotificationRead:(id:string)=>Promise<void>;
  markAllNotificationsRead:()=>Promise<void>;
  toast:(title:string,description?:string,tone?:ToastTone)=>void;
};

const emptySummary:PaymentSummary={paidTotal:0,refundedTotal:0,paidCount:0,failedCount:0,pendingCount:0,successRate:0};
const emptyVerificationSummary:VerificationSummary={pending:0,review:0,verifiedToday:0,rejectedToday:0};
const emptyDashboard:AdminDashboardRecord={counts:{totalUsers:0,totalSellers:0,activeSellers:0,verifiedSellers:0,totalListings:0,publishedListings:0,listingsUnderReview:0,rejectedListings:0,reportedListings:0,openReports:0,pendingVerifications:0,failedPayments:0,recordedPayments:0,openSupportTickets:0,paidSubscriptions:0},revenue:{today:0,thisMonth:0,total:0,subscriptionTotal:0,promotionTotal:0}};
const emptyData:AdminData={users:[],sellers:[],listings:[],reports:[],verifications:[],payments:[],supportTickets:[],categories:[],plans:[],subscriptions:[],promotionProducts:[],activityLog:[],moderationCases:[],paymentSummary:emptySummary,verificationSummary:emptyVerificationSummary,dashboard:emptyDashboard,notifications:[],unreadNotificationCount:0,markets:[],sellerPlanMarketPrices:[],promotionMarketPrices:[]};
const AdminDataContext=createContext<ContextValue|null>(null);

const titleCase=(value:string)=>value.replace(/_/g," ").replace(/\b\w/g,(c)=>c.toUpperCase());
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map((part)=>part[0]?.toUpperCase()).join("")||"ML";
const fmtDate=(value?:string|null)=>value?new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"—";
const fmtDay=(value?:string|null)=>value?new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(new Date(value)):"—";
const localeForCurrency=(currency:string)=>({BRL:"pt-BR",GHS:"en-GH",NGN:"en-NG",KES:"en-KE",ZAR:"en-ZA",XOF:"fr-CI"} as Record<string,string>)[currency]||"en";
const money=(value:number,currency="GHS",locale?:string)=>new Intl.NumberFormat(locale||localeForCurrency(currency),{style:"currency",currency}).format(value).replace(/\u00a0/g," ");
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

const DASHBOARD_QUERY=`query AdminDashboard { adminDashboard { counts { totalUsers totalSellers activeSellers verifiedSellers totalListings publishedListings listingsUnderReview rejectedListings reportedListings openReports pendingVerifications failedPayments recordedPayments openSupportTickets paidSubscriptions } revenue { today thisMonth total subscriptionTotal promotionTotal } } }`;
const NOTIFICATION_QUERY=`query AdminNotifications { notifications(limit: 50) { id type title body createdAt read href data } unreadNotificationCount }`;
const USER_QUERY=`query AdminUsers { adminUsers(limit: 200) { id name email phone active staff suspended joinedAt location { countryCode state stateCode city district } sellerId adminRole } }`;
const SELLER_QUERY=`query AdminSellers { adminSellers(limit: 100) { id userId name email sellerType countryCode verified suspended activatedAt suspendedAt suspensionReason listingCount } }`;
const BILLING_QUERY=`query AdminSellerBilling { adminSubscriptions(limit: 100) { id sellerId sellerName billingCycle status currentPeriodEnd promotionCreditsRemaining plan { id name monthlyPrice yearlyPrice listingLimit promotionCredits features visibilityWeight recommended active sortOrder } } adminSellerPlans { id name monthlyPrice yearlyPrice listingLimit promotionCredits features visibilityWeight recommended active sortOrder } }`;
const LISTING_QUERY=`query AdminListings { adminListings(limit: 200) { id slug title description price category categoryName condition location { countryCode state stateCode city district } images seller { id name avatarUrl verified sellerType countryCode isSuspended rating reviews activeListings memberSince location { countryCode state stateCode city district } } createdAt status sellerDeletedAt views favorites inquiries featured urgent } }`;
const MODERATION_QUERY=`query AdminModeration { moderationQueue(includeFinal: true, limit: 100) { id status source reviewReason decisionReason openedAt decidedAt decidedBy listing { id } } }`;
const REPORT_QUERY=`query AdminReports { reports(limit: 100) { id reference targetType targetId targetLabel reason statement priority status reporterName assignedTo internalNote decisionReason createdAt decidedAt } }`;
const VERIFICATION_QUERY=`query AdminVerifications { verifications(limit: 100) { id sellerId sellerName identityCountryCode identityType identityMasked cpfMasked legalName birthDate documentType documentFrontUrl documentBackUrl selfieUrl status riskLevel riskFlags submittedAt decisionNote } verificationQueueSummary { pending review verifiedToday rejectedToday } }`;
const PAYMENT_QUERY=`query AdminPayments { adminPayments(limit: 100) { id reference sellerId sellerName purpose method status amount currency provider providerOrderId planId billingCycle listingId promotionId createdAt } paymentSummary { paidTotal refundedTotal paidCount failedCount pendingCount successRate } }`;
const SUPPORT_QUERY=`query AdminSupport { supportTickets(limit: 200) { id reference userId userName subject category priority status assignedTo updatedAt createdAt } }`;
const CATEGORY_QUERY=`query AdminCategories { adminCategories { id name icon active subcategories { id name icon active } } }`;
const AUDIT_QUERY=`query AdminAudit { auditEvents(limit: 200) { id actorName actorEmail action targetType targetId targetLabel ipAddress createdAt } }`;
const PROMOTION_QUERY=`query PromotionOptions { promotionOptions { id name description durationDays price } }`;
const MARKET_QUERY=`query AdminMarketConfiguration { adminMarkets { code countryName locale currency currencySymbol timezone paymentProvider paymentMethods identityProvider identityLabel identityKey locationMode isEnabled isDefault sortOrder pricingReady pricingIssues } adminSellerPlanMarketPrices { marketCode currency planId planName monthlyPrice yearlyPrice active } adminPromotionMarketPrices { marketCode currency promotionId promotionName price active } }`;

type ApiLocation={countryCode?:string|null;state?:string;stateCode?:string;city?:string;district?:string|null};
type DashboardQueryData={adminDashboard:AdminDashboardRecord};
type NotificationQueryData={notifications:{id:string;type:string;title:string;body:string;createdAt:string;read:boolean;href:string|null;data:Record<string,unknown>|null}[];unreadNotificationCount:number};
type UserQueryRecord={id:string;name:string;email:string;phone:string|null;active:boolean;staff:boolean;suspended:boolean;joinedAt:string;location:ApiLocation|null;sellerId:string|null;adminRole:string|null};
type UserQueryData={adminUsers:UserQueryRecord[]};
type SellerQueryRecord={id:string;userId:string;name:string;email:string;sellerType:string;countryCode:string;verified:boolean;suspended:boolean;activatedAt:string;suspendedAt:string|null;suspensionReason:string|null;listingCount:number};
type SellerQueryData={adminSellers:SellerQueryRecord[]};
type SellerPlanQueryRecord={id:string;name:string;monthlyPrice:number;yearlyPrice:number;listingLimit:number;promotionCredits:number;features:string[];visibilityWeight:number;recommended:boolean;active:boolean;sortOrder:number};
type SubscriptionQueryRecord={id:string;sellerId:string;sellerName:string;billingCycle:string;status:string;currentPeriodEnd:string;promotionCreditsRemaining:number;plan:SellerPlanQueryRecord};
type BillingQueryData={adminSubscriptions:SubscriptionQueryRecord[];adminSellerPlans:SellerPlanQueryRecord[]};
type ListingQueryRecord={id:string;slug:string;title:string;description:string;price:number|null;category:string;categoryName:string;condition:string|null;location:ApiLocation|null;images:string[];seller:{id:string;name:string};createdAt:string;status:string;sellerDeletedAt:string|null;views:number;favorites:number;inquiries:number;featured:boolean;urgent:boolean};
type ListingQueryData={adminListings:ListingQueryRecord[]};
type ModerationQueryData={moderationQueue:{id:string;status:string;source:string;reviewReason:string;decisionReason:string|null;openedAt:string;decidedAt:string|null;decidedBy:string|null;listing:{id:string}}[]};
type ReportQueryRecord={id:string;reference:string;targetType:string;targetId:string;targetLabel:string|null;reason:string;statement:string|null;priority:string;status:string;reporterName:string|null;assignedTo:string|null;internalNote:string|null;decisionReason:string|null;createdAt:string;decidedAt:string|null};
type ReportQueryData={reports:ReportQueryRecord[]};
type VerificationQueryData={verifications:{id:string;sellerId:string;sellerName:string;identityCountryCode:string;identityType:string;identityMasked:string;cpfMasked:string;legalName:string;birthDate:string;documentType:string|null;documentFrontUrl:string|null;documentBackUrl:string|null;selfieUrl:string|null;status:string;riskLevel:string;riskFlags:string[];submittedAt:string;decisionNote:string|null}[];verificationQueueSummary:VerificationSummary};
type PaymentQueryData={adminPayments:{id:string;reference:string;sellerId:string;sellerName:string;purpose:string;method:string;status:string;amount:number;currency:string;provider:string;providerOrderId:string|null;planId:string|null;billingCycle:string|null;listingId:string|null;promotionId:string|null;createdAt:string}[];paymentSummary:PaymentSummary};
type SupportQueryData={supportTickets:{id:string;reference:string;userId:string;userName:string;subject:string;category:string;priority:string;status:string;assignedTo:string|null;updatedAt:string;createdAt:string}[]};
type CategoryQueryData={adminCategories:{id:string;name:string;icon:string|null;active:boolean;subcategories:{id:string;name:string;icon:string;active:boolean}[]}[]};
type AuditQueryData={auditEvents:{id:string;actorName:string|null;actorEmail:string|null;action:string;targetType:string;targetId:string;targetLabel:string|null;ipAddress:string|null;createdAt:string}[]};
type PromotionQueryData={promotionOptions:{id:string;name:string;description:string;durationDays:number;price:number}[]};
type MarketQueryData={adminMarkets:AdminMarketRecord[];adminSellerPlanMarketPrices:SellerPlanMarketPriceRecord[];adminPromotionMarketPrices:PromotionMarketPriceRecord[]};

export function AdminDataProvider({children}:{children:ReactNode}) {
  const router=useRouter(); const pathname=usePathname();
  const [data,setData]=useState<AdminData>(emptyData); const [sessionUser,setSessionUser]=useState<SessionUser|null>(null);
  const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null); const [toasts,setToasts]=useState<Toast[]>([]);
  const [statusOverrides,setStatusOverrides]=useState<Record<string,string>>({}); const [decisionOverrides,setDecisionOverrides]=useState<Record<string,Decision>>({});

  const toast=useCallback((title:string,description?:string,tone:ToastTone="success")=>{
    const id=Date.now()+Math.floor(Math.random()*1000); setToasts((current)=>[...current,{id,title,description,tone}]);
    window.setTimeout(()=>setToasts((current)=>current.filter((item)=>item.id!==id)),3600);
  },[]);

  const refresh=useCallback(async()=>{
    setError(null);
    try {
      const session=await apiRequest<SessionResponse>("/api/v1/auth/session/");
      if (!session.authenticated || !session.user?.isStaff) { setSessionUser(null); router.replace(`/login?next=${encodeURIComponent(pathname||"/dashboard")}`); return; }
      const user=session.user; setSessionUser(user);
      const allowed=(area:AdminArea)=>canAccessAdminArea(user.adminRole,area,user.isSuperuser);
      const [dashboardRes,notificationRes,usersRes,sellerRes,billingRes,listingRes,moderationRes,reportRes,verificationRes,paymentRes,supportRes,categoryRes,auditRes,promotionRes,marketRes]=await Promise.all([
        safeQuery<DashboardQueryData>(DASHBOARD_QUERY), safeQuery<NotificationQueryData>(NOTIFICATION_QUERY),
        allowed("users")?safeQuery<UserQueryData>(USER_QUERY):null,
        allowed("sellers")?safeQuery<SellerQueryData>(SELLER_QUERY):null,
        releaseFeatures.payments&&allowed("subscriptions")?safeQuery<BillingQueryData>(BILLING_QUERY):null,
        allowed("listings")?safeQuery<ListingQueryData>(LISTING_QUERY):null,
        allowed("moderation")?safeQuery<ModerationQueryData>(MODERATION_QUERY):null,
        allowed("reports")?safeQuery<ReportQueryData>(REPORT_QUERY):null,
        releaseFeatures.cpfVerification&&allowed("verifications")?safeQuery<VerificationQueryData>(VERIFICATION_QUERY):null,
        releaseFeatures.payments&&allowed("payments")?safeQuery<PaymentQueryData>(PAYMENT_QUERY):null,
        allowed("support")?safeQuery<SupportQueryData>(SUPPORT_QUERY):null,
        allowed("categories")?safeQuery<CategoryQueryData>(CATEGORY_QUERY):null,
        allowed("activity")?safeQuery<AuditQueryData>(AUDIT_QUERY):null,
        releaseFeatures.payments&&allowed("promotions")?safeQuery<PromotionQueryData>(PROMOTION_QUERY):null,
        allowed("markets")?safeQuery<MarketQueryData>(MARKET_QUERY):null,
      ]);
      const rawUsers=usersRes?.adminUsers||[]; const rawSubs=billingRes?.adminSubscriptions||[]; const rawListings=listingRes?.adminListings||[]; const rawReports=reportRes?.reports||[];
      const markets=(marketRes?.adminMarkets||[]).slice().sort((a,b)=>a.sortOrder-b.sortOrder||a.countryName.localeCompare(b.countryName));
      const marketByCode=new Map(markets.map((m)=>[m.code,m] as const));
      const defaultMarket=markets.find((m)=>m.isDefault)||markets.find((m)=>m.isEnabled)||markets[0];
      const subscriptions:SubscriptionRecord[]=rawSubs.map((s)=>({id:s.id,sellerId:s.sellerId,sellerName:s.sellerName,planName:s.plan.name,billingCycle:titleCase(s.billingCycle),status:uiStatus(s.status),periodEnd:fmtDate(s.currentPeriodEnd),promotionCreditsRemaining:s.promotionCreditsRemaining}));
      const subBySeller=new Map(rawSubs.map((s)=>[s.sellerId,s] as const));
      const userById=new Map(rawUsers.map((u)=>[u.id,u] as const));
      const users:AdminUserRecord[]=rawUsers.map((u)=>({id:u.id,name:u.name,email:u.email,phone:u.phone||"—",type:u.staff?"Administrator":u.sellerId?"Buyer & Seller":"Buyer",status:u.suspended?"Suspended":u.active?"Active":"Pending",joined:fmtDay(u.joinedAt),location:locationText(u.location||undefined),avatar:initials(u.name),sellerId:u.sellerId||null,adminRole:u.adminRole||null}));
      const sellers:AdminSellerRecord[]=(sellerRes?.adminSellers||[]).map((s)=>{const u=userById.get(s.userId); const sub=subBySeller.get(s.id); return {id:s.id,publicSellerId:s.id,userId:s.userId,name:s.name,owner:u?.name||s.email,plan:sub?.plan?.name||"Free",status:s.suspended?"Suspended":releaseFeatures.cpfVerification&&s.verified?"Verified":"Active",listings:s.listingCount,rating:"—",revenue:"—",location:locationText(u?.location||undefined),joined:fmtDay(s.activatedAt),avatar:"",countryCode:s.countryCode||u?.location?.countryCode||defaultMarket?.code||""};});
      const reports:AdminReportRecord[]=rawReports.map((r)=>({id:r.id,reference:r.reference,type:titleCase(r.targetType),target:r.targetLabel||r.targetId,targetId:r.targetId,reporter:r.reporterName||"—",status:uiStatus(r.status),created:fmtDate(r.createdAt),priority:titleCase(r.priority),reason:titleCase(r.reason),statement:r.statement||"",assignedTo:r.assignedTo||"—",internalNote:r.internalNote||"",decisionReason:r.decisionReason||""}));
      const reportCountByListing=new Map<string,number>(); rawReports.filter((r)=>r.targetType==="listing").forEach((r)=>reportCountByListing.set(r.targetId,(reportCountByListing.get(r.targetId)||0)+1));
      const listings:AdminListingRecord[]=rawListings.map((l)=>{const listingMarket=marketByCode.get(l.location?.countryCode||"")||defaultMarket;return {id:l.id,publicId:l.id,publicSlug:l.slug,publicSellerId:l.seller.id,title:l.title,seller:l.seller.name,category:l.categoryName,categorySlug:l.category,price:l.price==null?"Contact seller":money(Number(l.price),listingMarket?.currency||"GHS",listingMarket?.locale),priceValue:l.price==null?null:Number(l.price),images:(l.images||[]).map(mediaUrl),image:mediaUrl(l.images?.[0]),description:l.description,condition:l.condition||"—",location:locationText(l.location||undefined),status:l.sellerDeletedAt?"Deleted":uiStatus(l.status),rawStatus:l.status,sellerDeletedAt:l.sellerDeletedAt||"",created:fmtDate(l.createdAt),reports:reportCountByListing.get(l.id)||0,views:l.views||0,favorites:l.favorites||0,inquiries:l.inquiries||0,featured:Boolean(l.featured),urgent:Boolean(l.urgent)};});
      const listingCounts=new Map<string,number>(); rawListings.forEach((l)=>listingCounts.set(l.category,(listingCounts.get(l.category)||0)+1));
      const categories:CategoryRecord[]=(categoryRes?.adminCategories||[]).map((c)=>({id:c.id,name:c.name,slug:c.id,listings:listingCounts.get(c.id)||0,active:Boolean(c.active),icon:c.icon||"",subcategories:c.subcategories||[]}));
      const verifications:AdminVerificationRecord[]=(verificationRes?.verifications||[]).map((v)=>{const vm=marketByCode.get(v.identityCountryCode||"");return {id:v.id,sellerId:v.sellerId,seller:v.sellerName,owner:v.legalName||v.sellerName,document:v.documentType?titleCase(v.documentType):"Not provided",submitted:fmtDate(v.submittedAt),status:uiStatus(v.status),risk:titleCase(v.riskLevel),identityCountryCode:v.identityCountryCode||"",identityType:v.identityType||"",identityMasked:v.identityMasked||v.cpfMasked||"",identityLabel:vm?.identityLabel||titleCase(v.identityType||"Identity"),cpfMasked:v.cpfMasked||"",legalName:v.legalName,birthDate:v.birthDate,documentFrontUrl:mediaUrl(v.documentFrontUrl),documentBackUrl:mediaUrl(v.documentBackUrl),selfieUrl:mediaUrl(v.selfieUrl),flags:v.riskFlags||[],decisionNote:v.decisionNote||""};});
      const payments:AdminPaymentRecord[]=(paymentRes?.adminPayments||[]).map((p)=>({id:p.id,reference:p.reference,sellerId:p.sellerId,seller:p.sellerName,type:p.purpose==="subscription"?"Seller subscription":"Listing promotion",purpose:titleCase(p.purpose),method:p.method==="pix"?"Pix":p.method==="card"?"Credit card":titleCase(p.method),status:uiStatus(p.status),amount:money(Number(p.amount),p.currency||defaultMarket?.currency||"GHS",marketByCode.get((sellerRes?.adminSellers||[]).find((s)=>s.id===p.sellerId)?.countryCode||"")?.locale),amountValue:Number(p.amount),currency:p.currency||defaultMarket?.currency||"GHS",date:fmtDate(p.createdAt),provider:p.provider,providerOrderId:p.providerOrderId||"—",planId:p.planId||"",listingId:p.listingId||"",promotionId:p.promotionId||""}));
      const supportTickets:SupportTicketRecord[]=(supportRes?.supportTickets||[]).map((t)=>({id:t.id,reference:t.reference,user:t.userName,subject:t.subject,category:titleCase(t.category),priority:titleCase(t.priority),status:uiStatus(t.status),updated:fmtDate(t.updatedAt),assignedTo:t.assignedTo||"—"}));
      const plans:PlanRecord[]=(billingRes?.adminSellerPlans||[]).map((p)=>({id:p.id,name:p.name,price:"Market-priced",priceValue:Number(p.monthlyPrice),yearlyPrice:"Market-priced",yearlyPriceValue:Number(p.yearlyPrice),period:"",sellers:rawSubs.filter((s)=>s.plan.id===p.id&&s.status==="active").length,listings:p.listingLimit,featured:p.promotionCredits,badge:p.recommended?"Recommended":"",active:Boolean(p.active),visibilityWeight:Number(p.visibilityWeight),recommended:Boolean(p.recommended),features:p.features||[]}));
      const activityLog:ActivityRecord[]=(auditRes?.auditEvents||[]).map((a)=>({id:a.id,admin:a.actorName||"System",action:titleCase(String(a.action).replace(/[.]/g," ")),target:a.targetLabel||`${a.targetType} ${a.targetId}`,time:fmtDate(a.createdAt),ip:a.ipAddress||"—",targetType:a.targetType,targetId:a.targetId}));
      const promotionProducts:PromotionProductRecord[]=(promotionRes?.promotionOptions||[]).map((p)=>({id:p.id,name:p.name,description:p.description,durationDays:p.durationDays,price:defaultMarket?money(Number(p.price),defaultMarket.currency,defaultMarket.locale):String(p.price),priceValue:Number(p.price)}));
      const moderationCases:ModerationRecord[]=(moderationRes?.moderationQueue||[]).map((m)=>({id:m.id,status:m.status,source:m.source,reviewReason:m.reviewReason,decisionReason:m.decisionReason||"",openedAt:fmtDate(m.openedAt),decidedAt:fmtDate(m.decidedAt),decidedBy:m.decidedBy||"",listingId:m.listing.id}));
      const notifications:AdminNotificationRecord[]=(notificationRes?.notifications||[]).filter((n)=>n.data?.adminOperational===true).map((n)=>({id:n.id,type:n.type,title:n.title,body:n.body,createdAt:fmtDate(n.createdAt),read:Boolean(n.read),href:n.href||"",data:n.data||{}}));
      setData({users,sellers,listings,reports,verifications,payments,supportTickets,categories,plans,subscriptions,promotionProducts,activityLog,moderationCases,paymentSummary:paymentRes?.paymentSummary||emptySummary,verificationSummary:verificationRes?.verificationQueueSummary||emptyVerificationSummary,dashboard:dashboardRes?.adminDashboard||emptyDashboard,notifications,unreadNotificationCount:notifications.filter((item)=>!item.read).length,markets,sellerPlanMarketPrices:marketRes?.adminSellerPlanMarketPrices||[],promotionMarketPrices:marketRes?.adminPromotionMarketPrices||[]});
    } catch (e) {
      if (e instanceof MarketliftApiError && [401,403].includes(e.status)) router.replace("/login");
      else setError(e instanceof Error?e.message:"Could not load administration data.");
    } finally { setLoading(false); }
  },[pathname,router]);

  useEffect(()=>{const timeoutId=window.setTimeout(()=>{void refresh()},0);return()=>window.clearTimeout(timeoutId)},[refresh]);

  const canAccess=useCallback((area:AdminArea)=>Boolean(sessionUser&&canAccessAdminArea(sessionUser.adminRole,area,sessionUser.isSuperuser)),[sessionUser]);
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
      setStatusOverrides((current)=>({...current,[`${kind}:${id}`]:status}));
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
      setStatusOverrides((current)=>({...current,[`${kind}:${id}`]:status}));
      setDecisionOverrides((current)=>({...current,[`${kind}:${id}`]:{action,status,at:new Date().toISOString()}}));
      toast(message||`${id} ${action.toLowerCase()}`,`Final status: ${status}.`,tone); return true;
    } catch(e){toast("Action failed",e instanceof Error?e.message:"The decision could not be saved.","danger");return false;}
  },[mutate,toast]);

  const getStatus=useCallback((kind:string,id:string,fallback:string)=>{
    const override=statusOverrides[`${kind}:${id}`]; if(override)return override;
    const collections:Record<string,{id:string;status?:string}[]>={user:data.users,seller:data.sellers,listing:data.listings,report:data.reports,verification:data.verifications,ticket:data.supportTickets,payment:data.payments};
    return collections[kind]?.find((item)=>item.id===id)?.status||fallback;
  },[data,statusOverrides]);
  const getDecision=useCallback((kind:string,id:string):Decision|undefined=>{
    const override=decisionOverrides[`${kind}:${id}`]; if(override)return override;
    if(kind==="listing") { const c=data.moderationCases.find((m)=>m.listingId===id); if(c&&["approved","rejected"].includes(c.status)) return {action:titleCase(c.status),status:c.status==="approved"?"Active":"Rejected",at:c.decidedAt}; }
    if(kind==="verification") { const v=data.verifications.find((x)=>x.id===id); if(v&&["Verified","Rejected"].includes(v.status)) return {action:v.status==="Verified"?"Approved":"Rejected",status:v.status,at:v.submitted}; }
    if(kind==="report") { const r=data.reports.find((x)=>x.id===id); if(r&&["Resolved","Dismissed"].includes(r.status)) return {action:r.status,status:r.status,at:r.created}; }
    return undefined;
  },[data,decisionOverrides]);
  const deleteCategory=useCallback(async(id:string,name:string)=>{try{await mutate(`mutation($id:String!){deleteCategory(categoryId:$id){slug affectedListings}}`,{id});toast("Category deleted",`${name} was permanently removed from the catalog.`,"danger");return true;}catch(e){toast("Category could not be deleted",e instanceof Error?e.message:undefined,"danger");return false;}},[mutate,toast]);

  const saveSellerPlan=useCallback(async(input:{id?:string;name:string;monthlyPrice:number;yearlyPrice:number;listingLimit:number;promotionCredits:number;visibilityWeight:number;recommended:boolean;features:string[];active:boolean})=>{
    try {
      if(input.id) await mutate(`mutation($id:String!,$name:String!,$monthlyPrice:Float!,$yearlyPrice:Float!,$listingLimit:Int!,$promotionCredits:Int!,$visibilityWeight:Float!,$recommended:Boolean!,$features:[String!]!,$active:Boolean!){updateSellerPlan(id:$id,name:$name,monthlyPrice:$monthlyPrice,yearlyPrice:$yearlyPrice,listingLimit:$listingLimit,promotionCredits:$promotionCredits,visibilityWeight:$visibilityWeight,recommended:$recommended,features:$features,active:$active){id}}`,input);
      else await mutate(`mutation($name:String!,$monthlyPrice:Float!,$yearlyPrice:Float!,$listingLimit:Int!,$promotionCredits:Int!,$visibilityWeight:Float!,$recommended:Boolean!,$features:[String!],$active:Boolean!){createSellerPlan(name:$name,monthlyPrice:$monthlyPrice,yearlyPrice:$yearlyPrice,listingLimit:$listingLimit,promotionCredits:$promotionCredits,visibilityWeight:$visibilityWeight,recommended:$recommended,features:$features,active:$active){id}}`,input);
      toast(input.id?"Plan updated":"Plan created",`${input.name} is now saved in the seller plan catalog.`); return true;
    } catch(e){toast("Plan could not be saved",e instanceof Error?e.message:undefined,"danger");return false;}
  },[mutate,toast]);

  const updateMarket=useCallback(async(code:string,input:{isEnabled?:boolean;isDefault?:boolean;paymentProvider?:string;paymentMethods?:string[];identityProvider?:string;sortOrder?:number})=>{
    try { await mutate(`mutation($code:String!,$input:MarketConfigurationInput!){updateMarket(code:$code,input:$input){code isEnabled isDefault pricingReady}}`,{code,input}); toast("Market updated",`${code} configuration is live.`); return true; }
    catch(e){toast("Market could not be updated",e instanceof Error?e.message:undefined,"danger");return false;}
  },[mutate,toast]);

  const setSellerPlanMarketPrice=useCallback(async(input:{marketCode:string;planId:string;monthlyPrice:number;yearlyPrice:number;active:boolean})=>{
    try { await mutate(`mutation($marketCode:String!,$planId:String!,$monthlyPrice:Float!,$yearlyPrice:Float!,$active:Boolean!){setSellerPlanMarketPrice(marketCode:$marketCode,planId:$planId,monthlyPrice:$monthlyPrice,yearlyPrice:$yearlyPrice,active:$active){marketCode planId monthlyPrice yearlyPrice active}}`,input); toast("Plan price updated",`${input.marketCode} pricing is saved.`); return true; }
    catch(e){toast("Plan price could not be saved",e instanceof Error?e.message:undefined,"danger");return false;}
  },[mutate,toast]);

  const setPromotionMarketPrice=useCallback(async(input:{marketCode:string;promotionId:string;price:number;active:boolean})=>{
    try { await mutate(`mutation($marketCode:String!,$promotionId:String!,$price:Float!,$active:Boolean!){setPromotionMarketPrice(marketCode:$marketCode,promotionId:$promotionId,price:$price,active:$active){marketCode promotionId price active}}`,input); toast("Promotion price updated",`${input.marketCode} pricing is saved.`); return true; }
    catch(e){toast("Promotion price could not be saved",e instanceof Error?e.message:undefined,"danger");return false;}
  },[mutate,toast]);

  const replySupportTicket=useCallback(async(id:string,message:string)=>{
    try { await mutate(`mutation($id:ID!,$message:String!){adminReplySupportTicket(ticketId:$id,message:$message,status:"review"){id}}`,{id,message}); toast("Reply sent",`Ticket ${id} was updated.`); return true; }
    catch(e){toast("Reply could not be sent",e instanceof Error?e.message:undefined,"danger");return false;}
  },[mutate,toast]);

  const markNotificationRead=useCallback(async(id:string)=>{
    const current=data.notifications.find((item)=>item.id===id); if(!current||current.read)return;
    try { await graphqlRequest(`mutation($id:ID!){markNotificationRead(notificationId:$id)}`,{id}); setData((state)=>({...state,notifications:state.notifications.map((item)=>item.id===id?{...item,read:true}:item),unreadNotificationCount:Math.max(0,state.unreadNotificationCount-1)})); }
    catch(e){toast("Notification could not be updated",e instanceof Error?e.message:undefined,"danger");}
  },[data.notifications,toast]);

  const markAllNotificationsRead=useCallback(async()=>{
    const ids=data.notifications.filter((item)=>!item.read).map((item)=>item.id); if(!ids.length)return;
    try { await Promise.all(ids.map((id)=>graphqlRequest(`mutation($id:ID!){markNotificationRead(notificationId:$id)}`,{id}))); setData((state)=>({...state,notifications:state.notifications.map((item)=>({...item,read:true})),unreadNotificationCount:0})); }
    catch(e){toast("Notifications could not be updated",e instanceof Error?e.message:undefined,"danger");}
  },[data.notifications,toast]);

  const value=useMemo<ContextValue>(()=>({...data,sessionUser,loading,error,refresh,canAccess,getStatus,setStatus,getDecision,commitDecision,isCategoryDeleted:(id)=>!data.categories.some((c)=>c.id===id),deleteCategory,saveSellerPlan,updateMarket,setSellerPlanMarketPrice,setPromotionMarketPrice,replySupportTicket,markNotificationRead,markAllNotificationsRead,toast}),[data,sessionUser,loading,error,refresh,canAccess,getStatus,setStatus,getDecision,commitDecision,deleteCategory,saveSellerPlan,updateMarket,setSellerPlanMarketPrice,setPromotionMarketPrice,replySupportTicket,markNotificationRead,markAllNotificationsRead,toast]);
  return <AdminDataContext.Provider value={value}>{children}<div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">{toasts.map((item)=><div key={item.id} className={`pointer-events-auto rounded-xl border bg-white p-4 shadow-2xl shadow-slate-950/10 ${item.tone==="danger"?"border-red-200":item.tone==="info"?"border-blue-200":"border-emerald-200"}`}><div className="flex items-start gap-3"><span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-black ${item.tone==="danger"?"bg-red-50 text-red-700":item.tone==="info"?"bg-blue-50 text-blue-700":"bg-emerald-50 text-emerald-700"}`}>{item.tone==="danger"?"!":item.tone==="info"?"i":"✓"}</span><div><p className="text-sm font-black text-slate-900">{item.title}</p>{item.description&&<p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>}</div></div></div>)}</div></AdminDataContext.Provider>;
}

export function useAdminData(){const value=useContext(AdminDataContext);if(!value)throw new Error("useAdminData must be used within AdminDataProvider");return value;}
