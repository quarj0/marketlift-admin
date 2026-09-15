"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAdminData } from "@/components/admin/admin-data-provider";
import { ActionDialog } from "@/components/ui/action-dialog";
import { AdminButton } from "@/components/ui/admin-button";
import { PageHeader } from "@/components/ui/page-header";
import { graphqlRequest } from "@/lib/api-client";

type Payment = {
  method: string;
  status: string;
  amountCents: number;
  provider: string;
  providerStatus?: string | null;
};

type Rider = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  active: boolean;
};

type Shipment = {
  status: string;
  carrier?: string | null;
  trackingCode?: string | null;
  assignedAt?: string | null;
  confirmationSource?: string | null;
  rider?: Rider | null;
};

type Settlement = {
  status: string;
  amountCents: number;
  releaseAfter?: string | null;
};

type Order = {
  id: string;
  reference: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  status: string;
  fulfillmentMethod: string;
  totalCents: number;
  marketplaceFeeCents: number;
  sellerProceedsCents: number;
  currency: string;
  listingSnapshot: Record<string, unknown>;
  payment?: Payment | null;
  settlement?: Settlement | null;
  shipment?: Shipment | null;
  createdAt: string;
};

type Dispute = {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
};

type Policy = {
  categoryId: string;
  mode: "disabled" | "optional" | "enabled";
  requiresVerifiedSeller: boolean;
  maxCheckoutValueCents?: number | null;
  shippingAllowed: boolean;
  localDeliveryAllowed: boolean;
  pickupAllowed: boolean;
};

type AdminCategory = { id: string; name: string; active: boolean };
type CurrencySummary = {
  currency: string;
  grossCents: number;
  marketplaceFeeCents: number;
  heldSellerFundsCents: number;
};
type CommerceSummary = { currencies: CurrencySummary[]; openDisputes: number };
type CommerceData = {
  adminCommerceOrders: Order[];
  adminCommerceDisputes: Dispute[];
  adminCommerceSummary: CommerceSummary;
};

const PAGE_SIZE = 50;
const ASSIGNABLE_STATUSES = new Set(["processing", "shipped"]);
const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "awaiting_seller",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refund_pending",
  "refunded",
  "disputed",
];

const COMMERCE_QUERY = `
  query AdminCommerce(
    $orderStatus:String
    $disputeStatus:String
    $orderOffset:Int!
    $disputeOffset:Int!
    $limit:Int!
  ) {
    adminCommerceOrders(status:$orderStatus,limit:$limit,offset:$orderOffset) {
      id reference buyerId sellerId listingId status fulfillmentMethod
      totalCents marketplaceFeeCents sellerProceedsCents currency createdAt listingSnapshot
      payment { method status amountCents provider providerStatus }
      settlement { status amountCents releaseAfter }
      shipment {
        status carrier trackingCode assignedAt confirmationSource
        rider { id userId name active }
      }
    }
    adminCommerceDisputes(status:$disputeStatus,limit:$limit,offset:$disputeOffset) {
      id orderId reason description status createdAt
    }
    adminCommerceSummary {
      currencies { currency grossCents marketplaceFeeCents heldSellerFundsCents }
      openDisputes
    }
  }
`;
const RIDERS_QUERY = `query AdminDeliveryRiders { adminDeliveryRiders { id userId name email active } }`;
const CATEGORY_QUERY = `query CommerceAdminCategories { adminCategories { id name active } }`;
const POLICY_QUERY = `query($id:String!){categoryCommercePolicy(categoryId:$id){categoryId mode requiresVerifiedSeller maxCheckoutValueCents shippingAllowed localDeliveryAllowed pickupAllowed}}`;

function money(cents = 0, currency = "BRL") {
  const locale = ({ BRL: "pt-BR", GHS: "en-GH", NGN: "en-NG", KES: "en-KE", ZAR: "en-ZA" } as Record<string, string>)[currency] || "en";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

function human(value?: string | null) {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateTime(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function orderTitle(order: Order) {
  return String(order.listingSnapshot.title || `Listing ${order.listingId.slice(0, 8)}`);
}

function CurrencyValues({ rows, field }: { rows: CurrencySummary[]; field: keyof Omit<CurrencySummary, "currency"> }) {
  if (!rows.length) return <span>—</span>;
  return (
    <span className="space-y-1">
      {rows.map((row) => <span key={row.currency} className="block">{money(row[field], row.currency)}</span>)}
    </span>
  );
}

function CategoryPolicyEditor({
  category,
  policy,
  saving,
  onChange,
  onSave,
}: {
  category: AdminCategory;
  policy: Policy;
  saving: boolean;
  onChange: (patch: Partial<Policy>) => void;
  onSave: () => void;
}) {
  const disabled = policy.mode === "disabled";
  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 xl:max-w-xs">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-slate-900">{category.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${category.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {category.active ? "Active" : "Hidden"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">Control whether this category is classifieds-only or supports Marketlift checkout.</p>
        </div>
        <div className="grid flex-1 gap-4 lg:grid-cols-2 xl:max-w-3xl">
          <label className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Checkout policy
            <select
              value={policy.mode}
              onChange={(event) => onChange({ mode: event.target.value as Policy["mode"] })}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
            >
              <option value="disabled">Classified only</option>
              <option value="optional">Seller can offer checkout</option>
              <option value="enabled">Checkout available by default</option>
            </select>
          </label>
          <label className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Online payment limit (BRL)
            <input
              type="number"
              min="0.01"
              step="0.01"
              disabled={disabled}
              value={disabled || policy.maxCheckoutValueCents == null ? "" : policy.maxCheckoutValueCents / 100}
              onChange={(event) => onChange({ maxCheckoutValueCents: event.target.value === "" ? null : Math.round(Number(event.target.value) * 100) })}
              placeholder={disabled ? "Not applicable" : "No limit"}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:bg-slate-50"
            />
          </label>
        </div>
      </div>
      <div className="mt-5 grid gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 lg:grid-cols-2">
        <label className="flex items-start gap-2 text-xs font-semibold text-slate-700">
          <input type="checkbox" className="mt-0.5" checked={policy.requiresVerifiedSeller} disabled={disabled} onChange={(event) => onChange({ requiresVerifiedSeller: event.target.checked })} />
          <span>Require verified seller<span className="mt-1 block text-[11px] font-normal text-slate-500">Verification must be complete before Buy Now can be offered.</span></span>
        </label>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Delivery options</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={policy.shippingAllowed} disabled={disabled} onChange={(event) => onChange({ shippingAllowed: event.target.checked })} />Shipping</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={policy.localDeliveryAllowed} disabled={disabled} onChange={(event) => onChange({ localDeliveryAllowed: event.target.checked })} />Local delivery</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={policy.pickupAllowed} disabled={disabled} onChange={(event) => onChange({ pickupAllowed: event.target.checked })} />Pickup</label>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end"><AdminButton disabled={saving} onClick={onSave}>{saving ? "Saving…" : "Save rules"}</AdminButton></div>
    </article>
  );
}

export function CommerceClient() {
  const { toast, canAccess, sessionUser } = useAdminData();
  const [orders, setOrders] = useState<Order[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [summary, setSummary] = useState<CommerceSummary>({ currencies: [], openDisputes: 0 });
  const [riders, setRiders] = useState<Rider[]>([]);
  const [riderEmail, setRiderEmail] = useState("");
  const [riderBusy, setRiderBusy] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [assignmentBusy, setAssignmentBusy] = useState<string | null>(null);
  const [overrideBusy, setOverrideBusy] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [policyErrors, setPolicyErrors] = useState<Record<string, string>>({});
  const [policyBusy, setPolicyBusy] = useState<string | null>(null);
  const [resolutionBusy, setResolutionBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState("");
  const [disputeStatus, setDisputeStatus] = useState("");
  const [orderOffset, setOrderOffset] = useState(0);
  const [disputeOffset, setDisputeOffset] = useState(0);
  const requestVersion = useRef(0);
  const policyVersion = useRef(0);
  const canManagePolicies = canAccess("categories");
  const role = sessionUser?.adminRole || "";
  const canManageDelivery = Boolean(sessionUser?.isSuperuser || role === "super_admin" || role === "admin");

  const loadCommerce = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const data = await graphqlRequest<CommerceData>(COMMERCE_QUERY, {
        orderStatus: orderStatus || null,
        disputeStatus: disputeStatus || null,
        orderOffset,
        disputeOffset,
        limit: PAGE_SIZE,
      });
      if (version !== requestVersion.current) return;
      setOrders(data.adminCommerceOrders || []);
      setDisputes(data.adminCommerceDisputes || []);
      setSummary(data.adminCommerceSummary || { currencies: [], openDisputes: 0 });
    } catch (error) {
      if (version !== requestVersion.current) return;
      toast("Commerce data could not be loaded", error instanceof Error ? error.message : undefined, "danger");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [disputeOffset, disputeStatus, orderOffset, orderStatus, toast]);

  const loadRiders = useCallback(async () => {
    if (!canManageDelivery) return;
    try {
      const data = await graphqlRequest<{ adminDeliveryRiders: Rider[] }>(RIDERS_QUERY);
      setRiders(data.adminDeliveryRiders || []);
    } catch (error) {
      toast("Delivery riders could not be loaded", error instanceof Error ? error.message : undefined, "danger");
    }
  }, [canManageDelivery, toast]);

  async function refreshCommerce() {
    setLoading(true);
    await Promise.all([loadCommerce(), loadRiders()]);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCommerce(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCommerce]);

  useEffect(() => {
    if (!canManageDelivery) return;
    const timer = window.setTimeout(() => void loadRiders(), 0);
    return () => window.clearTimeout(timer);
  }, [canManageDelivery, loadRiders]);

  useEffect(() => {
    if (!canManagePolicies) return;
    const version = ++policyVersion.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const categoryData = await graphqlRequest<{ adminCategories: AdminCategory[] }>(CATEGORY_QUERY);
          if (version !== policyVersion.current) return;
          setCategories(categoryData.adminCategories || []);
          const results = await Promise.allSettled((categoryData.adminCategories || []).map(async (category) => {
            const data = await graphqlRequest<{ categoryCommercePolicy: Policy }>(POLICY_QUERY, { id: category.id });
            return [category.id, data.categoryCommercePolicy] as const;
          }));
          if (version !== policyVersion.current) return;
          const successful: Record<string, Policy> = {};
          const failures: Record<string, string> = {};
          results.forEach((result, index) => {
            const id = categoryData.adminCategories[index]?.id;
            if (!id) return;
            if (result.status === "fulfilled") successful[id] = result.value[1];
            else failures[id] = result.reason instanceof Error ? result.reason.message : "Policy could not be loaded.";
          });
          setPolicies(successful);
          setPolicyErrors(failures);
        } catch (error) {
          if (version !== policyVersion.current) return;
          toast("Commerce categories could not be loaded", error instanceof Error ? error.message : undefined, "danger");
        }
      })();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      if (policyVersion.current === version) policyVersion.current += 1;
    };
  }, [canManagePolicies, toast]);

  async function setRiderAccess(email: string, active: boolean) {
    const clean = email.trim();
    if (!clean) return;
    setRiderBusy(clean);
    try {
      await graphqlRequest(`mutation SetDeliveryRider($email:String!,$active:Boolean!){setDeliveryRider(email:$email,active:$active){id userId name email active}}`, { email: clean, active });
      setRiderEmail("");
      toast(active ? "Delivery rider enabled" : "Delivery rider disabled");
      await loadRiders();
    } catch (error) {
      toast("Rider access could not be updated", error instanceof Error ? error.message : undefined, "danger");
      throw error;
    } finally {
      setRiderBusy(null);
    }
  }

  async function assignRider(order: Order) {
    const riderId = assignments[order.id] || order.shipment?.rider?.id || "";
    if (!riderId) {
      toast("Select a rider first", undefined, "danger");
      return;
    }
    setAssignmentBusy(order.id);
    try {
      await graphqlRequest(`mutation AssignDeliveryRider($orderId:ID!,$riderId:ID!){assignCommerceDeliveryRider(orderId:$orderId,riderId:$riderId){id status shipment{status assignedAt rider{id userId name active}}}}`, { orderId: order.id, riderId });
      toast("Rider assigned", `${order.reference} is now in the rider's delivery queue.`);
      await refreshCommerce();
    } catch (error) {
      toast("Rider could not be assigned", error instanceof Error ? error.message : undefined, "danger");
    } finally {
      setAssignmentBusy(null);
    }
  }

  async function overrideDelivery(order: Order, reason: string) {
    setOverrideBusy(order.id);
    try {
      await graphqlRequest(`mutation AdminOverrideDelivery($orderId:ID!,$reason:String!){adminOverrideCommerceDelivery(orderId:$orderId,reason:$reason){id status shipment{status confirmationSource rider{id name active}} settlement{status releaseAfter}}}`, { orderId: order.id, reason });
      toast("Delivery override recorded", "The order is delivered and the buyer-protection hold has started.");
      await refreshCommerce();
    } catch (error) {
      toast("Delivery override failed", error instanceof Error ? error.message : undefined, "danger");
      throw error;
    } finally {
      setOverrideBusy(null);
    }
  }

  async function resolveDispute(disputeId: string, resolution: "buyer" | "seller") {
    setResolutionBusy(disputeId);
    try {
      await graphqlRequest(`mutation ResolveCommerceDispute($id:ID!,$resolution:String!){resolveCommerceDispute(disputeId:$id,resolution:$resolution){id status}}`, { id: disputeId, resolution });
      toast(resolution === "buyer" ? "Buyer refund initiated" : "Seller settlement released");
      await refreshCommerce();
    } catch (error) {
      toast("Dispute could not be resolved", error instanceof Error ? error.message : undefined, "danger");
      throw error;
    } finally {
      setResolutionBusy(null);
    }
  }

  function updatePolicy(categoryId: string, patch: Partial<Policy>) {
    setPolicies((current) => ({ ...current, [categoryId]: { ...current[categoryId], ...patch } }));
  }

  async function retryPolicy(categoryId: string) {
    try {
      const data = await graphqlRequest<{ categoryCommercePolicy: Policy }>(POLICY_QUERY, { id: categoryId });
      setPolicies((current) => ({ ...current, [categoryId]: data.categoryCommercePolicy }));
      setPolicyErrors((current) => { const next = { ...current }; delete next[categoryId]; return next; });
    } catch (error) {
      setPolicyErrors((current) => ({ ...current, [categoryId]: error instanceof Error ? error.message : "Policy could not be loaded." }));
    }
  }

  async function savePolicy(categoryId: string) {
    const policy = policies[categoryId];
    if (!policy) return;
    setPolicyBusy(categoryId);
    try {
      const data = await graphqlRequest<{ setCategoryCommercePolicy: Policy }>(`mutation($categoryId:String!,$mode:String!,$requiresVerifiedSeller:Boolean!,$maxCheckoutValueCents:Int,$shippingAllowed:Boolean!,$localDeliveryAllowed:Boolean!,$pickupAllowed:Boolean!){setCategoryCommercePolicy(categoryId:$categoryId,mode:$mode,requiresVerifiedSeller:$requiresVerifiedSeller,maxCheckoutValueCents:$maxCheckoutValueCents,shippingAllowed:$shippingAllowed,localDeliveryAllowed:$localDeliveryAllowed,pickupAllowed:$pickupAllowed){categoryId mode requiresVerifiedSeller maxCheckoutValueCents shippingAllowed localDeliveryAllowed pickupAllowed}}`, policy);
      setPolicies((current) => ({ ...current, [categoryId]: data.setCategoryCommercePolicy }));
      toast("Checkout rules saved");
    } catch (error) {
      toast("Checkout rules could not be saved", error instanceof Error ? error.message : undefined, "danger");
    } finally {
      setPolicyBusy(null);
    }
  }

  const activeRiders = riders.filter((rider) => rider.active);
  const orderHasNext = orders.length === PAGE_SIZE;
  const disputeHasNext = disputes.length === PAGE_SIZE;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace commerce"
        description="Monitor buyer-to-seller orders, protected settlements, local delivery and disputes. Subscription and promotion billing remains under Payments."
        actions={<AdminButton variant="outline" disabled={loading} onClick={() => void refreshCommerce()}>{loading ? "Refreshing…" : "Refresh"}</AdminButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Gross order value</p><p className="mt-2 text-xl font-black text-slate-900"><CurrencyValues rows={summary.currencies} field="grossCents" /></p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Marketlift fees</p><p className="mt-2 text-xl font-black text-slate-900"><CurrencyValues rows={summary.currencies} field="marketplaceFeeCents" /></p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Seller funds held</p><p className="mt-2 text-xl font-black text-slate-900"><CurrencyValues rows={summary.currencies} field="heldSellerFundsCents" /></p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Open disputes</p><p className="mt-2 text-2xl font-black text-slate-900">{summary.openDisputes}</p></div>
      </div>

      {canManageDelivery ? (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-black text-slate-900">Delivery riders</h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Riders are ordinary Marketplace accounts with delegated delivery capability. They are not administrators. A rider sees only deliveries explicitly assigned to that account.</p>
            <div className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
              <input value={riderEmail} onChange={(event) => setRiderEmail(event.target.value)} type="email" placeholder="rider@example.com" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500" />
              <AdminButton disabled={!riderEmail.trim() || riderBusy !== null} onClick={() => void setRiderAccess(riderEmail, true)}>{riderBusy ? "Updating…" : "Enable rider"}</AdminButton>
            </div>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {riders.map((rider) => (
              <article key={rider.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{rider.name}</p><p className="mt-1 truncate text-xs text-slate-500">{rider.email}</p></div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${rider.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{rider.active ? "Active" : "Disabled"}</span>
                </div>
                <div className="mt-4">
                  {rider.active ? (
                    <ActionDialog
                      trigger={<AdminButton variant="outline" disabled={riderBusy === rider.email}>Disable rider</AdminButton>}
                      title="Disable this rider?"
                      description="This removes delivery access. A rider with an order currently out for delivery cannot be disabled until that delivery is completed or reassigned."
                      confirmLabel="Disable rider"
                      tone="danger"
                      onConfirm={() => setRiderAccess(rider.email || "", false)}
                    />
                  ) : <AdminButton disabled={riderBusy === rider.email} onClick={() => void setRiderAccess(rider.email || "", true)}>Enable rider</AdminButton>}
                </div>
              </article>
            ))}
            {riders.length === 0 && <p className="text-xs text-slate-500">No delivery riders have been enabled yet.</p>}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black text-slate-900">Delivery operations</h2><p className="mt-1 text-xs text-slate-500">Your role can monitor commerce but cannot grant rider access, assign deliveries or override delivery completion.</p></section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-sm font-black text-slate-900">Orders & settlements</h2><p className="mt-1 text-xs text-slate-500">Payment-provider webhooks are authoritative. Local delivery is completed by the assigned rider with the buyer PIN; admins do not handle the PIN.</p></div>
          <select aria-label="Filter commerce orders by status" value={orderStatus} onChange={(event) => { setLoading(true); setOrderOffset(0); setOrderStatus(event.target.value); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
            <option value="">All order statuses</option>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{human(status)}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Fulfillment</th><th className="px-4 py-3">Rider operations</th><th className="px-4 py-3">Settlement</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isLocal = order.fulfillmentMethod === "local_delivery";
                const currentRider = order.shipment?.rider;
                const selectedRider = assignments[order.id] ?? currentRider?.id ?? "";
                return (
                  <tr key={order.id} className="align-top">
                    <td className="px-5 py-4"><p className="font-black text-slate-800">{order.reference}</p><p className="mt-1 text-[10px] text-slate-400">{dateTime(order.createdAt)}</p><p className="mt-1 text-[10px] font-semibold text-slate-500">{human(order.status)}</p></td>
                    <td className="px-4 py-4"><p className="max-w-[220px] truncate font-bold text-slate-700">{orderTitle(order)}</p><p className="mt-1 text-[10px] text-slate-400">Seller {order.sellerId.slice(0, 8)}…</p></td>
                    <td className="px-4 py-4"><p className="font-bold text-slate-700">{order.payment ? human(order.payment.method) : "—"}</p><p className="mt-1 text-[10px] text-slate-500">{order.payment ? human(order.payment.status) : "No payment"}</p>{order.payment && <p className="mt-1 text-[10px] font-semibold text-slate-400">{human(order.payment.provider)}{order.payment.providerStatus ? ` · ${human(order.payment.providerStatus)}` : ""}</p>}</td>
                    <td className="px-4 py-4"><p className="font-bold text-slate-700">{human(order.fulfillmentMethod)}</p><p className="mt-1 text-[10px] text-slate-500">{order.shipment ? human(order.shipment.status) : "—"}</p>{order.shipment?.trackingCode && <p className="mt-1 font-mono text-[10px] text-slate-500">{order.shipment.trackingCode}</p>}</td>
                    <td className="px-4 py-4">
                      {!isLocal ? <span className="text-slate-400">Not local delivery</span> : (
                        <div className="min-w-52 space-y-2">
                          {currentRider && <div><p className="font-bold text-slate-700">{currentRider.name}</p><p className="text-[10px] text-slate-400">{currentRider.active ? "Active rider" : "Rider access disabled"}{order.shipment?.assignedAt ? ` · assigned ${dateTime(order.shipment.assignedAt)}` : ""}</p></div>}
                          {!currentRider && <p className="text-[11px] text-slate-500">No rider assigned.</p>}
                          {canManageDelivery && ASSIGNABLE_STATUSES.has(order.status) && (
                            <div className="flex gap-2">
                              <select value={selectedRider} onChange={(event) => setAssignments((current) => ({ ...current, [order.id]: event.target.value }))} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px]">
                                <option value="">Select rider</option>{activeRiders.map((rider) => <option key={rider.id} value={rider.id}>{rider.name}</option>)}
                              </select>
                              <AdminButton disabled={!selectedRider || assignmentBusy === order.id} onClick={() => void assignRider(order)}>{assignmentBusy === order.id ? "Assigning…" : currentRider ? "Reassign" : "Assign"}</AdminButton>
                            </div>
                          )}
                          {order.status === "awaiting_seller" && <p className="text-[10px] leading-4 text-amber-700">Assignment opens after the seller starts processing the paid order.</p>}
                          {order.status === "out_for_delivery" && <p className="text-[10px] font-semibold text-emerald-700">Rider has started delivery. Buyer PIN stays buyer/rider-only.</p>}
                          {canManageDelivery && order.status === "out_for_delivery" && currentRider && (
                            <ActionDialog
                              trigger={<AdminButton variant="outline" disabled={overrideBusy === order.id}>Emergency override</AdminButton>}
                              title="Override delivery as completed?"
                              description="Use only when handoff is independently verified and the assigned rider cannot complete PIN confirmation, for example because of a device failure. This action is audited and starts buyer protection."
                              confirmLabel="Record emergency delivery"
                              tone="danger"
                              requireReason
                              minReasonLength={20}
                              reasonLabel="Override evidence / reason"
                              reasonPlaceholder="Explain how the handoff was independently verified and why rider PIN confirmation is unavailable…"
                              onConfirm={(reason) => overrideDelivery(order, reason)}
                            />
                          )}
                          {order.shipment?.confirmationSource && <p className="text-[10px] text-slate-500">Confirmed via {human(order.shipment.confirmationSource)}</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4"><p className="font-bold text-slate-700">{order.settlement ? human(order.settlement.status) : "—"}</p>{order.settlement?.releaseAfter && <p className="mt-1 text-[10px] text-slate-500">Release {dateTime(order.settlement.releaseAfter)}</p>}</td>
                    <td className="px-4 py-4 text-right"><p className="font-black text-slate-900">{money(order.totalCents, order.currency)}</p><p className="mt-1 text-[10px] text-emerald-700">Fee {money(order.marketplaceFeeCents, order.currency)}</p></td>
                  </tr>
                );
              })}
              {!loading && orders.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">No commerce orders match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 p-4"><span className="text-xs text-slate-500">Showing {orderOffset + (orders.length ? 1 : 0)}–{orderOffset + orders.length}</span><div className="flex gap-2"><AdminButton variant="outline" disabled={orderOffset === 0 || loading} onClick={() => { setLoading(true); setOrderOffset(Math.max(0, orderOffset - PAGE_SIZE)); }}>Previous</AdminButton><AdminButton variant="outline" disabled={!orderHasNext || loading} onClick={() => { setLoading(true); setOrderOffset(orderOffset + PAGE_SIZE); }}>Next</AdminButton></div></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="text-sm font-black text-slate-900">Disputes</h2><p className="mt-1 text-xs text-slate-500">Financial outcomes always require explicit confirmation.</p></div><select aria-label="Filter commerce disputes by status" value={disputeStatus} onChange={(event) => { setLoading(true); setDisputeOffset(0); setDisputeStatus(event.target.value); }} className="h-9 rounded-lg border border-slate-200 px-2 text-xs"><option value="">All</option><option value="open">Open</option><option value="resolved_buyer">Buyer resolved</option><option value="resolved_seller">Seller resolved</option></select></div>
        <div className="divide-y divide-slate-100">
          {disputes.map((dispute) => <article key={dispute.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black text-slate-800">Order {dispute.orderId}</p><p className="mt-1 text-xs font-bold text-red-700">{human(dispute.reason)}</p><p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600">{dispute.description || "No description provided."}</p><p className="mt-2 text-[10px] text-slate-400">{dateTime(dispute.createdAt)} · {human(dispute.status)}</p></div>{dispute.status === "open" && <div className="flex shrink-0 flex-wrap gap-2"><ActionDialog trigger={<AdminButton variant="danger" disabled={resolutionBusy === dispute.id}>Refund buyer</AdminButton>} title="Refund this buyer?" description="This monetary action refunds the approved charge and resolves the dispute for the buyer." confirmLabel="Refund buyer" tone="danger" onConfirm={() => resolveDispute(dispute.id, "buyer")} /><ActionDialog trigger={<AdminButton disabled={resolutionBusy === dispute.id}>Release seller</AdminButton>} title="Release seller proceeds?" description="This monetary action resolves the dispute for the seller and makes the blocked settlement available." confirmLabel="Release seller" onConfirm={() => resolveDispute(dispute.id, "seller")} /></div>}</div></article>)}
          {!loading && disputes.length === 0 && <p className="p-8 text-center text-xs text-slate-500">No disputes match this filter.</p>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 p-4"><span className="text-xs text-slate-500">Showing {disputeOffset + (disputes.length ? 1 : 0)}–{disputeOffset + disputes.length}</span><div className="flex gap-2"><AdminButton variant="outline" disabled={disputeOffset === 0 || loading} onClick={() => { setLoading(true); setDisputeOffset(Math.max(0, disputeOffset - PAGE_SIZE)); }}>Previous</AdminButton><AdminButton variant="outline" disabled={!disputeHasNext || loading} onClick={() => { setLoading(true); setDisputeOffset(disputeOffset + PAGE_SIZE); }}>Next</AdminButton></div></div>
      </section>

      {canManagePolicies ? (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5 sm:p-6"><h2 className="text-sm font-black text-slate-900">Category checkout rules</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Checkout still requires an eligible listing, stock, seller payment onboarding and at least one allowed fulfillment method.</p></div>
          <div className="divide-y divide-slate-100">
            {categories.map((category) => {
              const policy = policies[category.id];
              const failure = policyErrors[category.id];
              if (!policy) return <div key={category.id} className="flex items-center justify-between gap-4 p-5"><div><p className="text-sm font-black text-slate-800">{category.name}</p><p className="mt-1 text-xs text-red-600">{failure || "Loading checkout rules…"}</p></div>{failure && <AdminButton variant="outline" onClick={() => void retryPolicy(category.id)}>Retry</AdminButton>}</div>;
              return <CategoryPolicyEditor key={category.id} category={category} policy={policy} saving={policyBusy === category.id} onChange={(patch) => updatePolicy(category.id, patch)} onSave={() => void savePolicy(category.id)} />;
            })}
            {categories.length === 0 && <p className="p-8 text-center text-xs text-slate-500">No categories are available to configure.</p>}
          </div>
        </section>
      ) : <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black text-slate-900">Category checkout rules</h2><p className="mt-1 text-xs text-slate-500">Your administrator role can monitor commerce but cannot change category checkout rules.</p></section>}
    </div>
  );
}
