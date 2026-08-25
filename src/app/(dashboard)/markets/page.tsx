"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { ActionDialog } from "@/components/ui/action-dialog";
import { SafeLink } from "@/components/ui/safe-link";
import { Icons } from "@/lib/icons";
import { useAdminData } from "@/components/admin/admin-data-provider";
import type {
  AdminMarketRecord,
  PlanRecord,
  PromotionProductRecord,
  PromotionMarketPriceRecord,
  SellerPlanMarketPriceRecord,
} from "@/types/admin";

const supportedMethods: Record<string, string[]> = {
  BR: ["pix", "card", "boleto"],
  GH: ["card", "mobile_money"],
  NG: ["card", "bank_transfer", "ussd"],
  KE: ["card", "mobile_money"],
  ZA: ["card", "eft"],
  CI: ["card", "mobile_money"],
};
const methodLabel = (value: string) =>
  (
    ({
      mobile_money: "Mobile Money",
      bank_transfer: "Bank transfer",
      ussd: "USSD",
      eft: "EFT",
      pix: "Pix",
      boleto: "Boleto",
      card: "Card",
    }) as Record<string, string>
  )[value] || value.replace(/_/g, " ");
const providerLabel = (value: string) =>
  (
    ({
      paystack: "Paystack",
      mercado_pago: "Mercado Pago",
      disabled: "Disabled",
      mock: "Mock / test",
    }) as Record<string, string>
  )[value] || value.replace(/_/g, " ");
const formatMoney = (value: number, market: AdminMarketRecord) =>
  new Intl.NumberFormat(market.locale || "en", {
    style: "currency",
    currency: market.currency,
    maximumFractionDigits: market.currency === "XOF" ? 0 : 2,
  })
    .format(value)
    .replace(/\u00a0/g, " ");
type Filter = "all" | "enabled" | "setup";

export default function MarketsPage() {
  const {
    markets,
    plans,
    promotionProducts,
    sellerPlanMarketPrices,
    promotionMarketPrices,
    sessionUser,
    updateMarket,
    setSellerPlanMarketPrice,
    setPromotionMarketPrice,
  } = useAdminData();
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const activeCode =
    selected && markets.some((m) => m.code === selected)
      ? selected
      : markets.find((m) => m.isDefault)?.code || markets[0]?.code || "";
  const market = markets.find((m) => m.code === activeCode);
  const role = sessionUser?.adminRole || "";
  const canConfigure = Boolean(
    sessionUser?.isSuperuser || ["super_admin", "admin"].includes(role),
  );
  const canPrice = canConfigure || role === "finance";
  const normalized = query.trim().toLowerCase();
  const filtered = markets.filter(
    (item) =>
      (!normalized ||
        `${item.countryName} ${item.code} ${item.currency}`
          .toLowerCase()
          .includes(normalized)) &&
      (filter === "all" ||
        (filter === "enabled" && item.isEnabled) ||
        (filter === "setup" && !item.launchReady)),
  );
  const enabledCount = markets.filter((m) => m.isEnabled).length;
  const readyCount = markets.filter((m) => m.launchReady).length;
  const paymentReadyCount = markets.filter((m) => m.paymentReady).length;

  async function changeMarket(
    code: string,
    input: Parameters<typeof updateMarket>[1],
    key: string,
  ) {
    setBusy(key);
    try {
      await updateMarket(code, input);
    } finally {
      setBusy("");
    }
  }
  if (!markets.length)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Markets"
          description="Enable countries, choose the default market, and configure market-specific seller pricing."
        />
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          No market configuration is available. Apply the backend market
          migrations first.
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Markets"
        description="Control country availability, provider configuration and prices per currency. Secret values remain server-side."
        actions={
          <SafeLink
            href="/settings"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <Icons.activity size={15} /> Production readiness
          </SafeLink>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Enabled markets"
          value={enabledCount}
          meta={`${markets.length} supported`}
        />
        <Metric
          label="Configuration ready"
          value={readyCount}
          meta="Required launch configuration"
        />
        <Metric
          label="Payment credentials"
          value={paymentReadyCount}
          meta="Provider secrets detected"
        />
        <Metric
          label="Default market"
          value={markets.find((m) => m.isDefault)?.code || "—"}
          meta={markets.find((m) => m.isDefault)?.countryName || "Not selected"}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Icons.search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search country, code or currency…"
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="flex rounded-lg border border-slate-200 p-1">
            {(["all", "enabled", "setup"] as Filter[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${filter === item ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {item === "all"
                  ? "All"
                  : item === "enabled"
                    ? "Enabled"
                    : "Needs setup"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setSelected(item.code)}
            className={`rounded-xl border p-4 text-left transition ${activeCode === item.code ? "border-emerald-400 bg-emerald-50/40 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-sm text-slate-900">
                    {item.countryName}
                  </strong>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500">
                    {item.code}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {item.currency} · {item.locale} · {item.timezone}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {item.isDefault && <Badge tone="green">Default</Badge>}
                <Badge tone={item.isEnabled ? "green" : "gray"}>
                  {item.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[10px]">
              <MiniStatus
                label={providerLabel(item.paymentProvider)}
                ready={item.paymentReady}
              />
              <MiniStatus
                label={
                  item.pricingReady ? "Pricing ready" : "Pricing incomplete"
                }
                ready={item.pricingReady}
              />
              <MiniStatus
                label={
                  item.identityReady ? "Identity ready" : "Identity pending"
                }
                ready={item.identityReady}
              />
              <MiniStatus
                label={item.launchReady ? "Config ready" : "Needs setup"}
                ready={item.launchReady}
              />
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No markets match these filters.
          </div>
        )}
      </div>

      {market && (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-slate-950">
                    {market.countryName}
                  </h2>
                  {market.isDefault && (
                    <Badge tone="green">Default marketplace</Badge>
                  )}
                  <Badge tone={market.launchReady ? "green" : "amber"}>
                    {market.launchReady
                      ? "Configuration ready"
                      : "Setup required"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {market.currencySymbol} · {market.currency} ·{" "}
                  {market.identityLabel} ·{" "}
                  {market.locationMode.replace(/_/g, " ")}
                </p>
              </div>
              {canConfigure && (
                <div className="flex flex-wrap gap-2">
                  {!market.isDefault && (
                    <ActionDialog
                      trigger={
                        <AdminButton
                          disabled={busy !== "" || !market.launchReady}
                          variant="outline"
                          title={
                            !market.launchReady
                              ? "Resolve configuration blockers first."
                              : undefined
                          }
                        >
                          Make default
                        </AdminButton>
                      }
                      title={`Make ${market.countryName} the default market?`}
                      description="New visitors and accounts without an explicit market will use this country by default."
                      confirmLabel="Make default"
                      onConfirm={() =>
                        void changeMarket(
                          market.code,
                          { isDefault: true },
                          `default:${market.code}`,
                        )
                      }
                    />
                  )}
                  <ActionDialog
                    trigger={
                      <AdminButton
                        disabled={
                          busy !== "" ||
                          (market.isDefault && market.isEnabled) ||
                          (!market.isEnabled && !market.launchReady)
                        }
                        variant={market.isEnabled ? "danger" : "outline"}
                        title={
                          !market.isEnabled && !market.launchReady
                            ? "Resolve configuration blockers before enabling this market."
                            : market.isDefault && market.isEnabled
                              ? "Choose another default market before disabling this one."
                              : undefined
                        }
                      >
                        {market.isEnabled ? "Disable market" : "Enable market"}
                      </AdminButton>
                    }
                    title={
                      market.isEnabled
                        ? `Disable ${market.countryName}?`
                        : `Enable ${market.countryName}?`
                    }
                    description={
                      market.isEnabled
                        ? "The country will disappear from public market selection. Existing records remain intact."
                        : "The country will become available to marketplace users immediately."
                    }
                    confirmLabel={
                      market.isEnabled ? "Disable market" : "Enable market"
                    }
                    tone={market.isEnabled ? "danger" : "primary"}
                    onConfirm={() =>
                      void changeMarket(
                        market.code,
                        { isEnabled: !market.isEnabled },
                        `enabled:${market.code}`,
                      )
                    }
                  />
                </div>
              )}
            </div>
            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-2 xl:grid-cols-4">
              <ReadinessCard
                title="Launch configuration"
                ready={market.launchReady}
                message={
                  market.launchReady
                    ? "Required configuration is complete."
                    : `${market.launchIssues.length} issue${market.launchIssues.length === 1 ? "" : "s"} remain.`
                }
              />
              <ReadinessCard
                title="Payment provider"
                ready={market.paymentReady}
                message={market.paymentReadinessMessage}
              />
              <ReadinessCard
                title="Market pricing"
                ready={market.pricingReady}
                message={
                  market.pricingReady
                    ? "Every active paid product is priced."
                    : `${market.pricingIssues.length} pricing issue${market.pricingIssues.length === 1 ? "" : "s"}.`
                }
              />
              <ReadinessCard
                title="Identity provider"
                ready={market.identityReady}
                message={market.identityReadinessMessage}
              />
            </div>
            {!market.launchReady && market.launchIssues.length > 0 && (
              <IssueList
                title="Resolve before enabling/defaulting this market"
                issues={market.launchIssues}
              />
            )}{" "}
            {!market.pricingReady && market.pricingIssues.length > 0 && (
              <IssueList
                title="Paid seller services need pricing"
                issues={market.pricingIssues}
              />
            )}
            <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-3">
              <div>
                <Label>Payment provider</Label>
                <select
                  disabled={!canConfigure || busy !== ""}
                  value={market.paymentProvider}
                  onChange={(e) =>
                    void changeMarket(
                      market.code,
                      { paymentProvider: e.target.value },
                      `provider:${market.code}`,
                    )
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="disabled">Disabled</option>
                  <option
                    value={market.code === "BR" ? "mercado_pago" : "paystack"}
                  >
                    {market.code === "BR" ? "Mercado Pago" : "Paystack"}
                  </option>
                  <option value="mock">Mock / test</option>
                </select>
                <p className="mt-2 text-[10px] leading-4 text-slate-400">
                  Provider credentials are configured only on the
                  backend/server. The admin receives readiness status, never
                  secret values.
                </p>
              </div>
              <IdentityProviderEditor
                key={`${market.code}:${market.identityProvider}`}
                market={market}
                canConfigure={canConfigure}
                busy={busy !== ""}
                onSave={(value) =>
                  changeMarket(
                    market.code,
                    { identityProvider: value },
                    `identity:${market.code}`,
                  )
                }
              />
              <div>
                <Label>Enabled payment methods</Label>
                <div className="mt-2 flex min-h-10 flex-wrap gap-2">
                  {(supportedMethods[market.code] || market.paymentMethods).map(
                    (method) => {
                      const checked = market.paymentMethods.includes(method);
                      return (
                        <label
                          key={method}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-bold ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-500"}`}
                        >
                          <input
                            disabled={
                              !canConfigure ||
                              busy !== "" ||
                              market.paymentProvider === "disabled"
                            }
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? market.paymentMethods.filter(
                                    (x) => x !== method,
                                  )
                                : [...market.paymentMethods, method];
                              void changeMarket(
                                market.code,
                                { paymentMethods: next },
                                `methods:${market.code}`,
                              );
                            }}
                          />
                          {methodLabel(method)}
                        </label>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-black">
                  Seller plan pricing · {market.currency}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Prices apply only to sellers whose account market is{" "}
                  {market.countryName}.
                </p>
              </div>
              {!canPrice && (
                <span className="text-[10px] font-bold text-slate-400">
                  Read only
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {plans.map((plan) => {
                const row = sellerPlanMarketPrices.find(
                  (r) => r.marketCode === market.code && r.planId === plan.id,
                );
                return (
                  <PlanPriceEditor
                    key={`${market.code}:${plan.id}:${row?.monthlyPrice ?? ""}:${row?.yearlyPrice ?? ""}:${row?.active ?? ""}`}
                    market={market}
                    plan={plan}
                    row={row}
                    disabled={!canPrice}
                    onSave={setSellerPlanMarketPrice}
                  />
                );
              })}
            </div>
            {plans.length === 0 && (
              <div className="p-6 text-xs text-slate-500">
                Create seller plans first, then return here to price them for
                each market.
              </div>
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-black">
                  Promotion pricing · {market.currency}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  A promotion with no active market price will not be offered in{" "}
                  {market.countryName}.
                </p>
              </div>
              {!canPrice && (
                <span className="text-[10px] font-bold text-slate-400">
                  Read only
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {promotionProducts.map((product) => {
                const row = promotionMarketPrices.find(
                  (r) =>
                    r.marketCode === market.code &&
                    r.promotionId === product.id,
                );
                return (
                  <PromotionPriceEditor
                    key={`${market.code}:${product.id}:${row?.price ?? ""}:${row?.active ?? ""}`}
                    market={market}
                    product={product}
                    row={row}
                    disabled={!canPrice}
                    onSave={setPromotionMarketPrice}
                  />
                );
              })}
            </div>
            {promotionProducts.length === 0 && (
              <div className="p-6 text-xs text-slate-500">
                No promotion products are available yet.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function IdentityProviderEditor({
  market,
  canConfigure,
  busy,
  onSave,
}: {
  market: AdminMarketRecord;
  canConfigure: boolean;
  busy: boolean;
  onSave: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(market.identityProvider || "disabled");
  const valid = /^[a-z0-9_-]+$/.test(value);
  return (
    <div>
      <Label>Identity provider key</Label>
      <div className="mt-2 flex gap-2">
        <input
          disabled={!canConfigure || busy}
          value={value}
          onChange={(e) => setValue(e.target.value.trim().toLowerCase())}
          placeholder="disabled"
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
        />
        <AdminButton
          disabled={
            !canConfigure || busy || !valid || value === market.identityProvider
          }
          variant="outline"
          onClick={() => void onSave(value)}
        >
          Save
        </AdminButton>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-slate-400">
        Use <strong>disabled</strong> until the external verification
        adapter/plugin is installed and configured.
      </p>
    </div>
  );
}
function PlanPriceEditor({
  market,
  plan,
  row,
  disabled,
  onSave,
}: {
  market: AdminMarketRecord;
  plan: PlanRecord;
  row?: SellerPlanMarketPriceRecord;
  disabled: boolean;
  onSave: (input: {
    marketCode: string;
    planId: string;
    monthlyPrice: number;
    yearlyPrice: number;
    active: boolean;
  }) => Promise<boolean>;
}) {
  const [monthly, setMonthly] = useState(String(row?.monthlyPrice ?? 0));
  const [yearly, setYearly] = useState(String(row?.yearlyPrice ?? 0));
  const [active, setActive] = useState(row?.active ?? false);
  const [busy, setBusy] = useState(false);
  const monthlyValue = Number(monthly);
  const yearlyValue = Number(yearly);
  const invalid =
    !Number.isFinite(monthlyValue) ||
    !Number.isFinite(yearlyValue) ||
    monthlyValue < 0 ||
    yearlyValue < 0 ||
    (active && plan.id !== "free" && (monthlyValue <= 0 || yearlyValue <= 0));
  async function save() {
    if (invalid) return;
    setBusy(true);
    try {
      await onSave({
        marketCode: market.code,
        planId: plan.id,
        monthlyPrice: monthlyValue,
        yearlyPrice: yearlyValue,
        active,
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.3fr_1fr_1fr_auto_auto] lg:items-end">
      <div>
        <p className="text-sm font-black text-slate-900">{plan.name}</p>
        <p className="mt-1 text-[10px] text-slate-500">
          {formatMoney(monthlyValue || 0, market)} / month · {plan.listings}{" "}
          listings · {plan.featured} promotion credits
        </p>
        {invalid && (
          <p className="mt-1 text-[10px] font-bold text-red-600">
            Active paid plans require positive monthly and yearly prices.
          </p>
        )}
      </div>
      <NumberField
        label="Monthly"
        value={monthly}
        onChange={setMonthly}
        disabled={disabled}
      />
      <NumberField
        label="Yearly"
        value={yearly}
        onChange={setYearly}
        disabled={disabled}
      />
      <label className="flex h-10 items-center gap-2 text-xs font-bold text-slate-600">
        <input
          disabled={disabled}
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />{" "}
        Offered
      </label>
      <AdminButton
        disabled={disabled || busy || invalid}
        variant="outline"
        onClick={() => void save()}
      >
        {busy ? "Saving…" : "Save"}
      </AdminButton>
    </div>
  );
}
function PromotionPriceEditor({
  market,
  product,
  row,
  disabled,
  onSave,
}: {
  market: AdminMarketRecord;
  product: PromotionProductRecord;
  row?: PromotionMarketPriceRecord;
  disabled: boolean;
  onSave: (input: {
    marketCode: string;
    promotionId: string;
    price: number;
    active: boolean;
  }) => Promise<boolean>;
}) {
  const [price, setPrice] = useState(String(row?.price ?? 0));
  const [active, setActive] = useState(row?.active ?? false);
  const [busy, setBusy] = useState(false);
  const amount = Number(price);
  const invalid =
    !Number.isFinite(amount) || amount < 0 || (active && amount <= 0);
  async function save() {
    if (invalid) return;
    setBusy(true);
    try {
      await onSave({
        marketCode: market.code,
        promotionId: product.id,
        price: amount,
        active,
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.7fr_1fr_auto_auto] lg:items-end">
      <div>
        <p className="text-sm font-black text-slate-900">{product.name}</p>
        <p className="mt-1 text-[10px] text-slate-500">
          {product.description || `${product.durationDays} day promotion`} ·{" "}
          {product.durationDays} day{product.durationDays === 1 ? "" : "s"}
        </p>
        {invalid && (
          <p className="mt-1 text-[10px] font-bold text-red-600">
            An active promotion must have a price greater than zero.
          </p>
        )}
      </div>
      <NumberField
        label="Price"
        value={price}
        onChange={setPrice}
        disabled={disabled}
      />
      <label className="flex h-10 items-center gap-2 text-xs font-bold text-slate-600">
        <input
          disabled={disabled}
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />{" "}
        Offered
      </label>
      <AdminButton
        disabled={disabled || busy || invalid}
        variant="outline"
        onClick={() => void save()}
      >
        {busy ? "Saving…" : "Save"}
      </AdminButton>
    </div>
  );
}
function Metric({
  label,
  value,
  meta,
}: {
  label: string;
  value: number | string;
  meta: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <strong className="mt-2 block text-2xl font-black text-slate-950">
        {value}
      </strong>
      <p className="mt-1 text-[10px] text-slate-500">{meta}</p>
    </div>
  );
}
function ReadinessCard({
  title,
  ready,
  message,
}: {
  title: string;
  ready: boolean;
  message: string;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${ready ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid size-5 place-items-center rounded-full text-[10px] font-black text-white ${ready ? "bg-emerald-600" : "bg-amber-500"}`}
        >
          {ready ? "✓" : "!"}
        </span>
        <strong className="text-xs text-slate-900">{title}</strong>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-slate-600">{message}</p>
    </div>
  );
}
function MiniStatus({ label, ready }: { label: string; ready: boolean }) {
  return (
    <span
      className={`truncate font-bold ${ready ? "text-emerald-700" : "text-amber-700"}`}
    >
      {ready ? "✓" : "!"} {label}
    </span>
  );
}
function IssueList({ title, issues }: { title: string; issues: string[] }) {
  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-black text-amber-950">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-900">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}
function NumberField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        disabled={disabled}
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-50 disabled:text-slate-400"
      />
    </label>
  );
}
function Label({ children }: { children: string }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
      {children}
    </span>
  );
}
function Badge({
  children,
  tone,
}: {
  children: string;
  tone: "green" | "gray" | "amber";
}) {
  const style =
    tone === "green"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-500";
  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${style}`}
    >
      {children}
    </span>
  );
}
