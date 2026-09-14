"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminData } from "@/components/admin/admin-data-provider";
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
type CommerceData = {
  adminCommerceOrders: Order[];
  adminCommerceDisputes: Dispute[];
};

const COMMERCE_QUERY = `
  query AdminCommerce($orderStatus:String,$disputeStatus:String){
    adminCommerceOrders(status:$orderStatus,limit:200){
      id reference buyerId sellerId listingId status fulfillmentMethod
      totalCents marketplaceFeeCents sellerProceedsCents currency createdAt
      listingSnapshot
      payment{method status amountCents provider providerStatus}
      settlement{status amountCents releaseAfter}
      shipment{status carrier trackingCode}
    }
    adminCommerceDisputes(status:$disputeStatus,limit:200){
      id orderId reason description status createdAt
    }
  }
`;

function money(cents = 0, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    cents / 100,
  );
}

function dateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function human(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CommercePage() {
  const { categories, toast } = useAdminData();
  const [orders, setOrders] = useState<Order[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [loading, setLoading] = useState(true);
  const [policyBusy, setPolicyBusy] = useState<string | null>(null);
  const [resolutionBusy, setResolutionBusy] = useState<string | null>(null);
  const [pinOrderId, setPinOrderId] = useState("");
  const [deliveryPin, setDeliveryPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [disputeStatus, setDisputeStatus] = useState("");

  const loadCommerce = useCallback(async () => {
    try {
      const data = await graphqlRequest<CommerceData>(COMMERCE_QUERY, {
        orderStatus: orderStatus || null,
        disputeStatus: disputeStatus || null,
      });
      setOrders(data.adminCommerceOrders);
      setDisputes(data.adminCommerceDisputes);
    } catch (error) {
      toast(
        "Commerce data could not be loaded",
        error instanceof Error ? error.message : undefined,
        "danger",
      );
    } finally {
      setLoading(false);
    }
  }, [disputeStatus, orderStatus, toast]);

  async function refreshCommerce() {
    setLoading(true);
    await loadCommerce();
  }

  useEffect(() => {
    void loadCommerce();
  }, [loadCommerce]);

  const categoryKey = categories.map((category) => category.slug).join("|");
  useEffect(() => {
    if (!categoryKey) return;
    let cancelled = false;
    async function loadPolicies() {
      try {
        const rows = await Promise.all(
          categories.map(async (category) => {
            const data = await graphqlRequest<{
              categoryCommercePolicy: Policy;
            }>(
              `query($id:String!){categoryCommercePolicy(categoryId:$id){categoryId mode requiresVerifiedSeller maxCheckoutValueCents shippingAllowed localDeliveryAllowed pickupAllowed}}`,
              { id: category.slug },
            );
            return [category.slug, data.categoryCommercePolicy] as const;
          }),
        );
        if (!cancelled) setPolicies(Object.fromEntries(rows));
      } catch (error) {
        if (!cancelled) {
          toast(
            "Commerce policies could not be loaded",
            error instanceof Error ? error.message : undefined,
            "danger",
          );
        }
      }
    }
    void loadPolicies();
    return () => {
      cancelled = true;
    };
  }, [categoryKey, categories, toast]);

  const totals = useMemo(() => {
    const paidOrders = orders.filter((order) =>
      [
        "paid",
        "awaiting_seller",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "completed",
      ].includes(order.status),
    );
    return {
      gross: paidOrders.reduce((sum, order) => sum + order.totalCents, 0),
      fees: paidOrders.reduce(
        (sum, order) => sum + order.marketplaceFeeCents,
        0,
      ),
      held: orders
        .filter((order) =>
          ["pending", "held", "blocked"].includes(
            order.settlement?.status || "",
          ),
        )
        .reduce(
          (sum, order) => sum + (order.settlement?.amountCents || 0),
          0,
        ),
      openDisputes: disputes.filter((dispute) => dispute.status === "open").length,
    };
  }, [orders, disputes]);

  function updatePolicy(categoryId: string, patch: Partial<Policy>) {
    setPolicies((current) => ({
      ...current,
      [categoryId]: { ...current[categoryId], ...patch },
    }));
  }

  async function savePolicy(categoryId: string) {
    const policy = policies[categoryId];
    if (!policy) return;
    setPolicyBusy(categoryId);
    try {
      const data = await graphqlRequest<{
        setCategoryCommercePolicy: Policy;
      }>(
        `mutation($categoryId:String!,$mode:String!,$requiresVerifiedSeller:Boolean!,$maxCheckoutValueCents:Int,$shippingAllowed:Boolean!,$localDeliveryAllowed:Boolean!,$pickupAllowed:Boolean!){setCategoryCommercePolicy(categoryId:$categoryId,mode:$mode,requiresVerifiedSeller:$requiresVerifiedSeller,maxCheckoutValueCents:$maxCheckoutValueCents,shippingAllowed:$shippingAllowed,localDeliveryAllowed:$localDeliveryAllowed,pickupAllowed:$pickupAllowed){categoryId mode requiresVerifiedSeller maxCheckoutValueCents shippingAllowed localDeliveryAllowed pickupAllowed}}`,
        policy,
      );
      setPolicies((current) => ({
        ...current,
        [categoryId]: data.setCategoryCommercePolicy,
      }));
      toast("Commerce policy saved");
    } catch (error) {
      toast(
        "Policy update failed",
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
      await loadCommerce();
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

  async function confirmPin() {
    if (!pinOrderId.trim() || !/^\d{6}$/.test(deliveryPin)) return;
    setPinBusy(true);
    try {
      await graphqlRequest(
        `mutation($orderId:ID!,$deliveryPin:String!,$proof:JSON){confirmCommerceDeliveryPin(orderId:$orderId,deliveryPin:$deliveryPin,proof:$proof){id status}}`,
        {
          orderId: pinOrderId.trim(),
          deliveryPin,
          proof: { source: "admin_console" },
        },
      );
      setPinOrderId("");
      setDeliveryPin("");
      toast("Delivery confirmed", "The buyer-protection window has started.");
      await loadCommerce();
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
        {[
          ["Gross order value", money(totals.gross)],
          ["Marketlift fees", money(totals.fees)],
          ["Seller funds held", money(totals.held)],
          ["Open disputes", totals.openDisputes.toString()],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Orders & settlements
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Pagar.me webhooks are authoritative for payment state. Seller
              proceeds remain unavailable until delivery clears the protection
              window.
            </p>
          </div>
          <select
            value={orderStatus}
            onChange={(event) => setOrderStatus(event.target.value)}
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
          <table className="w-full min-w-[980px] text-left text-xs">
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
              {orders.map((order) => {
                const title =
                  typeof order.listingSnapshot?.title === "string"
                    ? order.listingSnapshot.title
                    : order.listingId;
                return (
                  <tr key={order.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-800">
                        {order.reference}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {dateTime(order.createdAt)}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">
                        {human(order.status)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-[240px] truncate font-bold text-slate-700">
                        {title}
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
                        {order.payment
                          ? human(order.payment.status)
                          : "No payment"}
                      </p>
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
                        {order.settlement
                          ? human(order.settlement.status)
                          : "—"}
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
                );
              })}
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
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-sm font-black text-slate-900">Disputes</h2>
              <p className="mt-1 text-xs text-slate-500">
                Resolving for the buyer refunds the order. Resolving for the
                seller releases the settlement.
              </p>
            </div>
            <select
              value={disputeStatus}
              onChange={(event) => setDisputeStatus(event.target.value)}
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-800">
                        {human(dispute.reason)}
                      </strong>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black ${
                          dispute.status === "open"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {human(dispute.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Order {dispute.orderId} · {dateTime(dispute.createdAt)}
                    </p>
                    {dispute.description && (
                      <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-600">
                        {dispute.description}
                      </p>
                    )}
                  </div>
                  {dispute.status === "open" && (
                    <div className="flex shrink-0 gap-2">
                      <AdminButton
                        variant="outline"
                        disabled={resolutionBusy === dispute.id}
                        onClick={() =>
                          void resolveDispute(dispute.id, "seller")
                        }
                      >
                        Release seller
                      </AdminButton>
                      <AdminButton
                        disabled={resolutionBusy === dispute.id}
                        onClick={() => void resolveDispute(dispute.id, "buyer")}
                      >
                        Refund buyer
                      </AdminButton>
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
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black text-slate-900">Delivery PIN</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            For Marketlift-managed local delivery, staff/riders can confirm handoff
            using the six-digit PIN shown only to the buyer.
          </p>
          <label className="mt-5 block text-xs font-bold text-slate-700">
            Order ID
            <input
              value={pinOrderId}
              onChange={(event) => setPinOrderId(event.target.value)}
              placeholder="Order UUID"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500"
            />
          </label>
          <label className="mt-4 block text-xs font-bold text-slate-700">
            Buyer PIN
            <input
              inputMode="numeric"
              maxLength={6}
              value={deliveryPin}
              onChange={(event) =>
                setDeliveryPin(event.target.value.replace(/\D/g, ""))
              }
              placeholder="000000"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 font-mono text-sm tracking-[.25em] outline-none focus:border-emerald-500"
            />
          </label>
          <AdminButton
            className="mt-5 w-full"
            disabled={
              pinBusy || !pinOrderId.trim() || deliveryPin.length !== 6
            }
            onClick={() => void confirmPin()}
          >
            {pinBusy ? "Confirming…" : "Confirm delivery"}
          </AdminButton>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-sm font-black text-slate-900">
            Category checkout policy
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Top-level categories define the default. Subcategories inherit this
            policy until they receive an explicit override.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {categories.map((category) => {
            const policy = policies[category.slug];
            if (!policy) {
              return (
                <div key={category.slug} className="p-5 text-xs text-slate-400">
                  Loading {category.name} policy…
                </div>
              );
            }
            return (
              <div
                key={category.slug}
                className="grid gap-4 p-5 lg:grid-cols-[1.2fr_.8fr_1.4fr_auto] lg:items-center"
              >
                <div>
                  <p className="text-sm font-black text-slate-800">
                    {category.name}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    /{category.slug}
                  </p>
                </div>
                <select
                  value={policy.mode}
                  onChange={(event) =>
                    updatePolicy(category.slug, {
                      mode: event.target.value as Policy["mode"],
                    })
                  }
                  className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold"
                >
                  <option value="disabled">Classified only</option>
                  <option value="optional">Checkout optional</option>
                  <option value="enabled">Checkout enabled</option>
                </select>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.requiresVerifiedSeller}
                      onChange={(event) =>
                        updatePolicy(category.slug, {
                          requiresVerifiedSeller: event.target.checked,
                        })
                      }
                    />
                    Verified seller
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.shippingAllowed}
                      onChange={(event) =>
                        updatePolicy(category.slug, {
                          shippingAllowed: event.target.checked,
                        })
                      }
                    />
                    Shipping
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.localDeliveryAllowed}
                      onChange={(event) =>
                        updatePolicy(category.slug, {
                          localDeliveryAllowed: event.target.checked,
                        })
                      }
                    />
                    Local delivery
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.pickupAllowed}
                      onChange={(event) =>
                        updatePolicy(category.slug, {
                          pickupAllowed: event.target.checked,
                        })
                      }
                    />
                    Pickup
                  </label>
                </div>
                <AdminButton
                  variant="outline"
                  disabled={policyBusy === category.slug}
                  onClick={() => void savePolicy(category.slug)}
                >
                  {policyBusy === category.slug ? "Saving…" : "Save"}
                </AdminButton>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
