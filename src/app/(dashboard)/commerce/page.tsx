"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminData } from "@/components/admin/admin-data-provider";
import { AdminButton } from "@/components/ui/admin-button";
import { ActionDialog } from "@/components/ui/action-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { graphqlRequest } from "@/lib/api-client";

type Payment = {
  method: string;
  status: string;
  amountCents: number;
  provider: string;
  providerStatus?: string | null;
};
type Settlement = {
  status: string;
  amountCents: number;
  releaseAfter?: string | null;
};
type Shipment = {
  status: string;
  carrier?: string | null;
  trackingCode?: string | null;
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
const LOCAL_DELIVERY_CONFIRMABLE_STATUSES = new Set([
  "awaiting_seller",
  "processing",
  "shipped",
  "out_for_delivery",
]);

const COMMERCE_QUERY = `query AdminCommerce($orderStatus:String,$disputeStatus:String,$orderOffset:Int!,$disputeOffset:Int!,$limit:Int!){adminCommerceOrders(status:$orderStatus,limit:$limit,offset:$orderOffset){id reference buyerId sellerId listingId status fulfillmentMethod totalCents marketplaceFeeCents sellerProceedsCents currency createdAt listingSnapshot payment{method status amountCents provider providerStatus} settlement{status amountCents releaseAfter} shipment{status carrier trackingCode}} adminCommerceDisputes(status:$disputeStatus,limit:$limit,offset:$disputeOffset){id orderId reason description status createdAt} adminCommerceSummary{currencies{currency grossCents marketplaceFeeCents heldSellerFundsCents} openDisputes}}`;
const CATEGORY_QUERY = `query CommerceAdminCategories { adminCategories { id name active } }`;
const POLICY_QUERY = `query($id:String!){categoryCommercePolicy(categoryId:$id){categoryId mode requiresVerifiedSeller maxCheckoutValueCents shippingAllowed localDeliveryAllowed pickupAllowed}}`;

const MODE_COPY: Record<
  Policy["mode"],
  { label: string; description: string }
> = {
  disabled: {
    label: "Classified only",
    description:
      "Buyers contact the seller directly. Marketlift does not process payment for listings in this category.",
  },
  optional: {
    label: "Seller can offer checkout",
    description:
      "Eligible sellers may enable Buy Now per listing, while buyers can still chat or arrange an inspection.",
  },
  enabled: {
    label: "Checkout available by default",
    description:
      "Eligible listings can use Marketlift checkout by default, subject to seller, stock, price and fulfillment checks.",
  },
};

function money(cents = 0, currency = "BRL") {
  const locale = (
    {
      BRL: "pt-BR",
      GHS: "en-GH",
      NGN: "en-NG",
      KES: "en-KE",
      ZAR: "en-ZA",
    } as Record<string, string>
  )[currency] || "en";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    cents / 100,
  );
}

function dateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function human(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function orderTitle(order: Order) {
  return typeof order.listingSnapshot?.title === "string"
    ? order.listingSnapshot.title
    : order.listingId;
}

function CurrencyValues({
  rows,
  field,
}: {
  rows: CurrencySummary[];
  field: "grossCents" | "marketplaceFeeCents" | "heldSellerFundsCents";
}) {
  if (!rows.length) return <span>—</span>;
  return (
    <span className="space-y-1">
      {rows.map((row) => (
        <span key={row.currency} className="block">
          {money(row[field], row.currency)}
        </span>
      ))}
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
  const checkoutDisabled = policy.mode === "disabled";
  const modeCopy = MODE_COPY[policy.mode];

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 xl:max-w-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-slate-900">{category.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                category.active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {category.active ? "Active category" : "Hidden category"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Configure how listings in this category can transact through Marketlift.
          </p>
        </div>

        <div className="grid flex-1 gap-5 lg:grid-cols-2 xl:max-w-3xl">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Checkout policy
              <select
                aria-label={`Checkout policy for ${category.name}`}
                value={policy.mode}
                onChange={(event) =>
                  onChange({ mode: event.target.value as Policy["mode"] })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
              >
                <option value="disabled">Classified only</option>
                <option value="optional">Seller can offer checkout</option>
                <option value="enabled">Checkout available by default</option>
              </select>
            </label>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              {modeCopy.description}
            </p>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Online payment limit
            </label>
            <div
              className={`mt-1 flex h-10 items-center rounded-lg border border-slate-200 ${
                checkoutDisabled ? "bg-slate-50" : "bg-white"
              }`}
            >
              <span className="border-r border-slate-200 px-3 text-xs font-black text-slate-500">
                R$
              </span>
              <input
                aria-label={`Online payment limit for ${category.name} in BRL`}
                type="number"
                min="0.01"
                step="0.01"
                disabled={checkoutDisabled}
                value={
                  checkoutDisabled || policy.maxCheckoutValueCents == null
                    ? ""
                    : policy.maxCheckoutValueCents / 100
                }
                onChange={(event) =>
                  onChange({
                    maxCheckoutValueCents:
                      event.target.value === ""
                        ? null
                        : Math.round(Number(event.target.value) * 100),
                  })
                }
                placeholder={checkoutDisabled ? "Not applicable" : "No limit"}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs outline-none disabled:cursor-not-allowed disabled:text-slate-400"
              />
              {!checkoutDisabled && policy.maxCheckoutValueCents != null && (
                <button
                  type="button"
                  onClick={() => onChange({ maxCheckoutValueCents: null })}
                  className="mr-2 rounded-md px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  No limit
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              {checkoutDisabled
                ? "No online payment is processed for classified-only listings."
                : "Maximum listing price Marketlift will allow through checkout. Leave blank for no category cap."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Seller requirements
          </p>
          <label className="mt-3 flex items-start gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={policy.requiresVerifiedSeller}
              disabled={checkoutDisabled}
              onChange={(event) =>
                onChange({ requiresVerifiedSeller: event.target.checked })
              }
            />
            <span>
              Require verified seller
              <span className="mt-1 block text-[11px] font-normal leading-4 text-slate-500">
                Seller verification must be complete before Buy Now can be offered.
              </span>
            </span>
          </label>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Delivery options
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={policy.shippingAllowed}
                disabled={checkoutDisabled}
                onChange={(event) =>
                  onChange({ shippingAllowed: event.target.checked })
                }
              />
              Shipping
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={policy.localDeliveryAllowed}
                disabled={checkoutDisabled}
                onChange={(event) =>
                  onChange({ localDeliveryAllowed: event.target.checked })
                }
              />
              Local delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={policy.pickupAllowed}
                disabled={checkoutDisabled}
                onChange={(event) =>
                  onChange({ pickupAllowed: event.target.checked })
                }
              />
              Buyer pickup
            </label>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-slate-500">
            These options apply only to Marketlift checkout. Classified-only listings can still arrange handoff in chat.
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <AdminButton disabled={saving} onClick={onSave}>
          {saving ? "Saving…" : "Save rules"}
        </AdminButton>
      </div>
    </article>
  );
}

export default function CommercePage() {
  const { toast, canAccess } = useAdminData();
  const [orders, setOrders] = useState<Order[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [summary, setSummary] = useState<CommerceSummary>({
    currencies: [],
    openDisputes: 0,
  });
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [policyErrors, setPolicyErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [policyBusy, setPolicyBusy] = useState<string | null>(null);
  const [resolutionBusy, setResolutionBusy] = useState<string | null>(null);
  const [pinOrder, setPinOrder] = useState<Order | null>(null);
  const [deliveryPin, setDeliveryPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [disputeStatus, setDisputeStatus] = useState("");
  const [orderOffset, setOrderOffset] = useState(0);
  const [disputeOffset, setDisputeOffset] = useState(0);
  const requestVersion = useRef(0);
  const policyVersion = useRef(0);
  const canManagePolicies = canAccess("categories");

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
      setOrders(data.adminCommerceOrders);
      setDisputes(data.adminCommerceDisputes);
      setSummary(data.adminCommerceSummary);
    } catch (error) {
      if (version !== requestVersion.current) return;
      toast(
        "Commerce data could not be loaded",
        error instanceof Error ? error.message : undefined,
        "danger",
      );
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [disputeOffset, disputeStatus, orderOffset, orderStatus, toast]);

  async function refreshCommerce() {
    setLoading(true);
    await loadCommerce();
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCommerce(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCommerce]);

  useEffect(() => {
    if (!canManagePolicies) return;
    const version = ++policyVersion.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const categoryData = await graphqlRequest<{
            adminCategories: AdminCategory[];
          }>(CATEGORY_QUERY);
          if (version !== policyVersion.current) return;
          setCategories(categoryData.adminCategories);

          const results = await Promise.allSettled(
            categoryData.adminCategories.map(async (category) => {
              const data = await graphqlRequest<{
                categoryCommercePolicy: Policy;
              }>(POLICY_QUERY, { id: category.id });
              return [category.id, data.categoryCommercePolicy] as const;
            }),
          );
          if (version !== policyVersion.current) return;

          const successful: Record<string, Policy> = {};
          const failures: Record<string, string> = {};
          results.forEach((result, index) => {
            const id = categoryData.adminCategories[index]?.id;
            if (!id) return;
            if (result.status === "fulfilled") {
              successful[id] = result.value[1];
            } else {
              failures[id] =
                result.reason instanceof Error
                  ? result.reason.message
                  : "Policy could not be loaded.";
            }
          });
          setPolicies(successful);
          setPolicyErrors(failures);
          if (Object.keys(failures).length) {
            toast(
              "Some commerce policies could not be loaded",
              `${Object.keys(failures).length} categor${
                Object.keys(failures).length === 1 ? "y" : "ies"
              } can be retried independently.`,
              "danger",
            );
          }
        } catch (error) {
          if (version !== policyVersion.current) return;
          toast(
            "Commerce categories could not be loaded",
            error instanceof Error ? error.message : undefined,
            "danger",
          );
        }
      })();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      if (policyVersion.current === version) policyVersion.current += 1;
    };
  }, [canManagePolicies, toast]);

  const orderHasNext = orders.length === PAGE_SIZE;
  const disputeHasNext = disputes.length === PAGE_SIZE;

  function updatePolicy(categoryId: string, patch: Partial<Policy>) {
    setPolicies((current) => ({
      ...current,
      [categoryId]: { ...current[categoryId], ...patch },
    }));
  }

  async function retryPolicy(categoryId: string) {
    try {
      const data = await graphqlRequest<{ categoryCommercePolicy: Policy }>(
        POLICY_QUERY,
        { id: categoryId },
      );
      setPolicies((current) => ({
        ...current,
        [categoryId]: data.categoryCommercePolicy,
      }));
      setPolicyErrors((current) => {
        const next = { ...current };
        delete next[categoryId];
        return next;
      });
    } catch (error) {
      setPolicyErrors((current) => ({
        ...current,
        [categoryId]:
          error instanceof Error ? error.message : "Policy could not be loaded.",
      }));
    }
  }

  async function savePolicy(categoryId: string) {
    const policy = policies[categoryId];
    if (!policy) return;
    setPolicyBusy(categoryId);
    try {
      const data = await graphqlRequest<{ setCategoryCommercePolicy: Policy }>(
        `mutation($categoryId:String!,$mode:String!,$requiresVerifiedSeller:Boolean!,$maxCheckoutValueCents:Int,$shippingAllowed:Boolean!,$localDeliveryAllowed:Boolean!,$pickupAllowed:Boolean!){setCategoryCommercePolicy(categoryId:$categoryId,mode:$mode,requiresVerifiedSeller:$requiresVerifiedSeller,maxCheckoutValueCents:$maxCheckoutValueCents,shippingAllowed:$shippingAllowed,localDeliveryAllowed:$localDeliveryAllowed,pickupAllowed:$pickupAllowed){categoryId mode requiresVerifiedSeller maxCheckoutValueCents shippingAllowed localDeliveryAllowed pickupAllowed}}`,
        policy,
      );
      setPolicies((current) => ({
        ...current,
        [categoryId]: data.setCategoryCommercePolicy,
      }));
      toast("Checkout rules saved");
    } catch (error) {
      toast(
        "Checkout rules could not be saved",
        error instanceof Error ? error.message : undefined,
        "danger",
      );
    } finally {
      setPolicyBusy(null);
    }
  }

  async function resolveDispute(
    disputeId: string,
    resolution: "buyer" | "seller",
  ) {
    setResolutionBusy(disputeId);
    try {
      await graphqlRequest(
        `mutation($id:ID!,$resolution:String!){resolveCommerceDispute(disputeId:$id,resolution:$resolution){id status}}`,
        { id: disputeId, resolution },
      );
      toast(
        resolution === "buyer"
          ? "Buyer refund initiated"
          : "Seller settlement released",
      );
      await refreshCommerce();
    } catch (error) {
      toast(
        "Dispute could not be resolved",
        error instanceof Error ? error.message : undefined,
        "danger",
      );
    } finally {
      setResolutionBusy(null);
    }
  }

  function chooseDeliveryOrder(order: Order) {
    setPinOrder(order);
    setDeliveryPin("");
    window.setTimeout(() => {
      document
        .getElementById("delivery-confirmation")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  async function confirmPin() {
    if (!pinOrder || !/^\d{6}$/.test(deliveryPin)) return;
    setPinBusy(true);
    try {
      await graphqlRequest(
        `mutation($orderId:ID!,$deliveryPin:String!,$proof:JSON){confirmCommerceDeliveryPin(orderId:$orderId,deliveryPin:$deliveryPin,proof:$proof){id status}}`,
        {
          orderId: pinOrder.id,
          deliveryPin,
          proof: { source: "admin_console" },
        },
      );
      setPinOrder(null);
      setDeliveryPin("");
      toast(
        "Delivery confirmed",
        "The buyer-protection window has started.",
      );
      await refreshCommerce();
    } catch (error) {
      toast(
        "Delivery could not be confirmed",
        error instanceof Error ? error.message : undefined,
        "danger",
      );
    } finally {
      setPinBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace commerce"
        description="Monitor buyer-to-seller orders, settlement holds, disputes and category checkout rules. Subscription and promotion billing remains under Payments."
        actions={
          <AdminButton variant="outline" onClick={() => void refreshCommerce()}>
            Refresh
          </AdminButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Gross order value
          </p>
          <p className="mt-2 text-xl font-black text-slate-900">
            <CurrencyValues rows={summary.currencies} field="grossCents" />
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Marketlift fees
          </p>
          <p className="mt-2 text-xl font-black text-slate-900">
            <CurrencyValues
              rows={summary.currencies}
              field="marketplaceFeeCents"
            />
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Seller funds held
          </p>
          <p className="mt-2 text-xl font-black text-slate-900">
            <CurrencyValues
              rows={summary.currencies}
              field="heldSellerFundsCents"
            />
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Open disputes
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {summary.openDisputes}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Orders & settlements
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Payment-provider webhooks are authoritative for payment state. Local-delivery orders can be selected here for PIN confirmation.
            </p>
          </div>
          <select
            aria-label="Filter commerce orders by status"
            value={orderStatus}
            onChange={(event) => {
              setLoading(true);
              setOrderOffset(0);
              setOrderStatus(event.target.value);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="">All order statuses</option>
            {[
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
            ].map((status) => (
              <option key={status} value={status}>
                {human(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Settlement</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-800">{order.reference}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {dateTime(order.createdAt)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">
                      {human(order.status)}
                    </p>
                    {order.fulfillmentMethod === "local_delivery" &&
                      LOCAL_DELIVERY_CONFIRMABLE_STATUSES.has(order.status) && (
                        <button
                          type="button"
                          onClick={() => chooseDeliveryOrder(order)}
                          className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black text-emerald-700 hover:bg-emerald-100"
                        >
                          Confirm delivery
                        </button>
                      )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-[240px] truncate font-bold text-slate-700">
                      {orderTitle(order)}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Seller {order.sellerId.slice(0, 8)}…
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-700">
                      {order.payment ? human(order.payment.method) : "—"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {order.payment ? human(order.payment.status) : "No payment"}
                    </p>
                    {order.payment && (
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        {human(order.payment.provider)}
                        {order.payment.providerStatus
                          ? ` · ${human(order.payment.providerStatus)}`
                          : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-700">
                      {human(order.fulfillmentMethod)}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {order.shipment ? human(order.shipment.status) : "—"}
                    </p>
                    {order.shipment?.trackingCode && (
                      <p className="mt-1 font-mono text-[10px] text-slate-500">
                        {order.shipment.trackingCode}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-700">
                      {order.settlement ? human(order.settlement.status) : "—"}
                    </p>
                    {order.settlement?.releaseAfter && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        Release {dateTime(order.settlement.releaseAfter)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-black text-slate-900">
                      {money(order.totalCents, order.currency)}
                    </p>
                    <p className="mt-1 text-[10px] text-emerald-700">
                      Fee {money(order.marketplaceFeeCents, order.currency)}
                    </p>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No commerce orders match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <span className="text-xs text-slate-500">
            Showing {orderOffset + (orders.length ? 1 : 0)}–
            {orderOffset + orders.length}
          </span>
          <div className="flex gap-2">
            <AdminButton
              variant="outline"
              disabled={orderOffset === 0 || loading}
              onClick={() => {
                setLoading(true);
                setOrderOffset(Math.max(0, orderOffset - PAGE_SIZE));
              }}
            >
              Previous
            </AdminButton>
            <AdminButton
              variant="outline"
              disabled={!orderHasNext || loading}
              onClick={() => {
                setLoading(true);
                setOrderOffset(orderOffset + PAGE_SIZE);
              }}
            >
              Next
            </AdminButton>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="text-sm font-black text-slate-900">Disputes</h2>
              <p className="mt-1 text-xs text-slate-500">
                Financial outcomes always require confirmation.
              </p>
            </div>
            <select
              aria-label="Filter commerce disputes by status"
              value={disputeStatus}
              onChange={(event) => {
                setLoading(true);
                setDisputeOffset(0);
                setDisputeStatus(event.target.value);
              }}
              className="h-9 rounded-lg border border-slate-200 px-2 text-xs"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="resolved_buyer">Buyer resolved</option>
              <option value="resolved_seller">Seller resolved</option>
            </select>
          </div>
          <div className="divide-y divide-slate-100">
            {disputes.map((dispute) => (
              <article key={dispute.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-800">
                      Order {dispute.orderId}
                    </p>
                    <p className="mt-1 text-xs font-bold text-red-700">
                      {human(dispute.reason)}
                    </p>
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600">
                      {dispute.description || "No description provided."}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      {dateTime(dispute.createdAt)} · {human(dispute.status)}
                    </p>
                  </div>
                  {dispute.status === "open" && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <ActionDialog
                        trigger={
                          <AdminButton
                            variant="danger"
                            disabled={resolutionBusy === dispute.id}
                          >
                            Refund buyer
                          </AdminButton>
                        }
                        title="Refund this buyer?"
                        description="This is a monetary action. It refunds the approved charge and resolves the dispute for the buyer."
                        confirmLabel="Refund buyer"
                        tone="danger"
                        onConfirm={() =>
                          void resolveDispute(dispute.id, "buyer")
                        }
                      />
                      <ActionDialog
                        trigger={
                          <AdminButton disabled={resolutionBusy === dispute.id}>
                            Release seller
                          </AdminButton>
                        }
                        title="Release seller proceeds?"
                        description="This is a monetary action. It resolves the dispute for the seller and makes the blocked settlement available."
                        confirmLabel="Release seller"
                        onConfirm={() =>
                          void resolveDispute(dispute.id, "seller")
                        }
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
            {!loading && disputes.length === 0 && (
              <p className="p-8 text-center text-xs text-slate-500">
                No disputes match this filter.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 p-4">
            <span className="text-xs text-slate-500">
              Showing {disputeOffset + (disputes.length ? 1 : 0)}–
              {disputeOffset + disputes.length}
            </span>
            <div className="flex gap-2">
              <AdminButton
                variant="outline"
                disabled={disputeOffset === 0 || loading}
                onClick={() => {
                  setLoading(true);
                  setDisputeOffset(Math.max(0, disputeOffset - PAGE_SIZE));
                }}
              >
                Previous
              </AdminButton>
              <AdminButton
                variant="outline"
                disabled={!disputeHasNext || loading}
                onClick={() => {
                  setLoading(true);
                  setDisputeOffset(disputeOffset + PAGE_SIZE);
                }}
              >
                Next
              </AdminButton>
            </div>
          </div>
        </section>

        <section
          id="delivery-confirmation"
          className="rounded-xl border border-slate-200 bg-white p-5"
        >
          <h2 className="text-sm font-black text-slate-900">
            Confirm local delivery
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Marketlift creates the order ID and delivery PIN automatically. Select an eligible local-delivery order above; the buyer provides the six-digit PIN at handoff.
          </p>

          {!pinOrder ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-bold text-slate-700">
                No local-delivery order selected
              </p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Choose “Confirm delivery” from an eligible order in the Orders & settlements table. You never need to type or create an order UUID manually.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                      Selected order
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {pinOrder.reference}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                      {orderTitle(pinOrder)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {money(pinOrder.totalCents, pinOrder.currency)} · {human(pinOrder.status)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pinBusy}
                    onClick={() => {
                      setPinOrder(null);
                      setDeliveryPin("");
                    }}
                    className="rounded-md px-2 py-1 text-[10px] font-black text-slate-500 hover:bg-white disabled:opacity-50"
                  >
                    Change
                  </button>
                </div>
              </div>

              <label className="mt-4 block text-xs font-bold text-slate-700">
                Buyer delivery PIN
                <input
                  value={deliveryPin}
                  disabled={pinBusy}
                  onChange={(event) =>
                    setDeliveryPin(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-center text-lg font-black tracking-[.35em] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                  placeholder="000000"
                  aria-describedby="delivery-pin-help"
                />
              </label>
              <p
                id="delivery-pin-help"
                className="mt-2 text-[11px] leading-5 text-slate-500"
              >
                Ask the buyer for the six-digit handoff code shown in their Marketlift order. Do not invent or assign a PIN.
              </p>
              <AdminButton
                className="mt-4 w-full"
                disabled={pinBusy || deliveryPin.length !== 6}
                onClick={() => void confirmPin()}
              >
                {pinBusy ? "Confirming…" : "Confirm successful handoff"}
              </AdminButton>
            </>
          )}
        </section>
      </div>

      {canManagePolicies ? (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="text-sm font-black text-slate-900">
              Category checkout rules
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              Decide whether each category is classifieds-only or can use Marketlift checkout. Checkout still requires an eligible listing, stock, seller payment onboarding and at least one allowed fulfillment method.
            </p>
            <div className="mt-4 grid gap-3 text-[11px] text-slate-600 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="font-black text-slate-800">Classified only</span>
                <span className="mt-1 block leading-4">
                  Contact, chat and inspection only; Marketlift does not process the item payment.
                </span>
              </div>
              <div className="rounded-lg bg-sky-50 p-3">
                <span className="font-black text-sky-900">
                  Seller can offer checkout
                </span>
                <span className="mt-1 block leading-4 text-sky-800">
                  The seller chooses per listing whether Buy Now is available.
                </span>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <span className="font-black text-emerald-900">
                  Checkout available by default
                </span>
                <span className="mt-1 block leading-4 text-emerald-800">
                  Eligible listings can offer Buy Now unless another rule blocks it.
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.map((category) => {
              const policy = policies[category.id];
              const failure = policyErrors[category.id];
              if (!policy) {
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {category.name}
                      </p>
                      <p className="mt-1 text-xs text-red-600">
                        {failure || "Loading checkout rules…"}
                      </p>
                    </div>
                    {failure && (
                      <AdminButton
                        variant="outline"
                        onClick={() => void retryPolicy(category.id)}
                      >
                        Retry
                      </AdminButton>
                    )}
                  </div>
                );
              }

              return (
                <CategoryPolicyEditor
                  key={category.id}
                  category={category}
                  policy={policy}
                  saving={policyBusy === category.id}
                  onChange={(patch) => updatePolicy(category.id, patch)}
                  onSave={() => void savePolicy(category.id)}
                />
              );
            })}
            {categories.length === 0 && (
              <p className="p-8 text-center text-xs text-slate-500">
                No categories are available to configure.
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black text-slate-900">
            Category checkout rules
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Your administrator role can monitor commerce but cannot change category checkout rules.
          </p>
        </section>
      )}
    </div>
  );
}
