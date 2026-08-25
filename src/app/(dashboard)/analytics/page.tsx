"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { graphqlRequest } from "@/lib/api-client";
import { useAdminData } from "@/components/admin/admin-data-provider";

type Point = { date: string; value: number };
type Metric = { label: string; value: number };
type Analytics = {
  userGrowth: Point[];
  sellerGrowth: Point[];
  listingGrowth: Point[];
  revenue: Point[];
  categoryDistribution: Metric[];
  planDistribution: Metric[];
  verificationOutcomes: Metric[];
  reportOutcomes: Metric[];
  billingActivity: Metric[];
  health: {
    paymentSuccessPercent: number;
    openReportRatePercent: number;
    activeListingPercent: number;
    activeSellerPercent: number;
  };
};

const QUERY = `query AdminAnalytics($days:Int!,$countryCode:String){adminAnalytics(days:$days,countryCode:$countryCode){userGrowth{date value} sellerGrowth{date value} listingGrowth{date value} revenue{date value} categoryDistribution{label value} planDistribution{label value} verificationOutcomes{label value} reportOutcomes{label value} billingActivity{label value} health{paymentSuccessPercent openReportRatePercent activeListingPercent activeSellerPercent}}}`;

export default function AnalyticsPage() {
  const { toast, markets } = useAdminData();
  const [days, setDays] = useState(30);
  const [marketCode, setMarketCode] = useState("");
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const enabledMarkets = useMemo(
    () => markets.filter((market) => market.isEnabled),
    [markets],
  );
  const selectedMarket = enabledMarkets.find(
    (market) => market.code === marketCode,
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await graphqlRequest<{ adminAnalytics: Analytics }>(
          QUERY,
          { days, countryCode: marketCode || null },
        );
        if (active) setData(result.adminAnalytics);
      } catch (e) {
        if (active)
          toast(
            "Analytics unavailable",
            e instanceof Error ? e.message : undefined,
            "danger",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [days, marketCode, toast]);

  const totals = useMemo(
    () =>
      data
        ? {
            users: data.userGrowth.reduce((sum, point) => sum + point.value, 0),
            sellers: data.sellerGrowth.reduce(
              (sum, point) => sum + point.value,
              0,
            ),
            listings: data.listingGrowth.reduce(
              (sum, point) => sum + point.value,
              0,
            ),
          }
        : { users: 0, sellers: 0, listings: 0 },
    [data],
  );
  const scope = selectedMarket?.countryName || "All enabled markets";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={`Marketplace growth, safety and operational performance · ${scope}.`}
        actions={
          <>
            <label className="sr-only" htmlFor="analytics-market">
              Market
            </label>
            <select
              id="analytics-market"
              value={marketCode}
              onChange={(event) => {
                setLoading(true);
                setMarketCode(event.target.value);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="">All enabled markets</option>
              {enabledMarkets.map((market) => (
                <option key={market.code} value={market.code}>
                  {market.countryName} · {market.currency}
                </option>
              ))}
            </select>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              {[7, 30, 90].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setDays(value);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold ${days === value ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {value} days
                </button>
              ))}
            </div>
          </>
        }
      />
      {loading && !data ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Loading analytics…
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="New users"
              value={Math.round(totals.users).toLocaleString()}
              change={`${days} days`}
              meta={scope}
            />
            <KpiCard
              label="New sellers"
              value={Math.round(totals.sellers).toLocaleString()}
              change={`${days} days`}
              meta={scope}
            />
            <KpiCard
              label="New listings"
              value={Math.round(totals.listings).toLocaleString()}
              change={`${days} days`}
              meta={scope}
            />
            <KpiCard
              label="Payment success"
              value={`${data.health.paymentSuccessPercent.toFixed(1)}%`}
              change={`${days} days`}
              meta={scope}
            />
          </div>
          <div className="grid gap-6">
            <SeriesCard
              title="Marketplace growth"
              series={[
                { label: "Users", rows: data.userGrowth },
                { label: "Sellers", rows: data.sellerGrowth },
                { label: "Listings", rows: data.listingGrowth },
              ]}
            />
            {!marketCode && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-900">
                Cross-market revenue is intentionally not combined because
                currencies differ. Select one market for currency-specific
                financial analysis, and use Payments for canonical transaction
                totals.
              </div>
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="Top categories"
              rows={data.categoryDistribution}
            />
            <MetricCard title="Seller plans" rows={data.planDistribution} />
            <MetricCard title="Billing activity" rows={data.billingActivity} />
            <MetricCard
              title="Verification outcomes"
              rows={data.verificationOutcomes}
            />
            <MetricCard title="Report outcomes" rows={data.reportOutcomes} />
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-black">Marketplace health</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Current operational ratios · {scope}
              </p>
              <div className="mt-5 space-y-4">
                <Health
                  label="Payment success"
                  value={data.health.paymentSuccessPercent}
                />
                <Health
                  label="Active listings"
                  value={data.health.activeListingPercent}
                />
                <Health
                  label="Active sellers"
                  value={data.health.activeSellerPercent}
                />
                <Health
                  label="Open report rate"
                  value={data.health.openReportRatePercent}
                  inverse
                />
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Analytics could not be loaded.
        </div>
      )}
    </div>
  );
}

function SeriesCard({
  title,
  series,
}: {
  title: string;
  series: { label: string; rows: Point[] }[];
}) {
  const max = Math.max(
    ...series.flatMap((item) => item.rows.map((point) => point.value)),
    1,
  );
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-black">{title}</h2>
      <div className="mt-5 space-y-5">
        {series.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-xs">
              <strong>{item.label}</strong>
              <span className="text-slate-400">
                {Math.round(
                  item.rows.reduce((sum, point) => sum + point.value, 0),
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex h-28 items-end gap-1 overflow-hidden rounded-lg bg-slate-50 p-2">
              {item.rows.map((point) => (
                <div
                  key={point.date}
                  title={`${point.date}: ${point.value}`}
                  className="min-w-1 flex-1 rounded-t bg-emerald-500/80"
                  style={{
                    height: `${Math.max(point.value ? 4 : 0, Math.round((point.value / max) * 100))}%`,
                  }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-slate-400">
              <span>{item.rows[0]?.date || "—"}</span>
              <span>{item.rows.at(-1)?.date || "—"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function MetricCard({ title, rows }: { title: string; rows: Metric[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-black">{title}</h2>
      <div className="mt-5 space-y-3">
        {rows.length ? (
          rows.slice(0, 8).map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between gap-3 text-xs">
                <span className="truncate text-slate-600">{row.label}</span>
                <strong>
                  {Number.isInteger(row.value)
                    ? row.value.toLocaleString()
                    : row.value.toFixed(1)}
                </strong>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.max(row.value ? 4 : 0, Math.round((row.value / max) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">No data for this selection.</p>
        )}
      </div>
    </section>
  );
}
function Health({
  label,
  value,
  inverse = false,
}: {
  label: string;
  value: number;
  inverse?: boolean;
}) {
  const good = inverse ? value < 5 : value >= 80;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <strong className={good ? "text-emerald-700" : "text-slate-900"}>
          {value.toFixed(1)}%
        </strong>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
