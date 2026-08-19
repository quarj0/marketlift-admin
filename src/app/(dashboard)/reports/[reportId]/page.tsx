/* eslint-disable @typescript-eslint/no-unused-vars */
import { SafeLink } from "@/components/ui/safe-link";
import { reports } from "@/data/mock-data";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions, MockAction } from "@/components/admin/entity-actions";
import { Icons } from "@/lib/icons";
import {
  PublicListingLink,
  PublicSellerLink,
} from "@/components/admin/public-marketplace-link";
import { sellers } from "@/data/mock-data";
export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = reports.find((x) => x.id === reportId) ?? reports[0];
  return (
    <div className="space-y-6">
      <SafeLink href="/reports" className="text-xs font-bold text-slate-500">
        ← Back to reports
      </SafeLink>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black">{report.id}</h1>
            <LiveStatusBadge
              kind="report"
              id={report.id}
              status={report.status}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {report.reason} · {report.created}
          </p>
        </div>
        <EntityActions kind="report" id={report.id} name={report.target} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Reported content</h2>
            <div className="mt-4 rounded-xl bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {report.type}
              </p>
              <h3 className="mt-2 text-base font-black text-slate-900">
                {report.target}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                The reported marketplace content is shown here for administrator
                investigation. Review the original marketplace content and
                relevant account history before deciding.
              </p>
              {report.type === "Listing" ? (
                <PublicListingLink
                  title={report.target}
                  className="mt-4"
                  label="View public listing"
                />
              ) : report.type === "Seller" ? (
                (() => {
                  const seller = sellers.find(
                    (item) => item.name === report.target,
                  );
                  return seller ? (
                    <PublicSellerLink
                      sellerId={seller.id}
                      sellerName={seller.name}
                      className="mt-4"
                    />
                  ) : null;
                })()
              ) : null}
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Reporter statement</h2>
            <blockquote className="mt-4 rounded-lg border-l-4 border-orange-400 bg-orange-50/60 p-4 text-xs leading-6 text-slate-700">
              “The seller asked me to make a payment outside the platform and
              the information in the listing does not appear to match the
              product they showed me.”
            </blockquote>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Report details</h2>
            <div className="mt-4 space-y-4 text-xs">
              <Row label="Reporter" value={report.reporter} />
              <Row label="Reason" value={report.reason} />
              <Row label="Priority" value={report.priority} />
              <Row label="Target type" value={report.type} />
              <Row label="Created" value={report.created} />
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Internal note</h2>
            <label htmlFor="report-internal-note" className="sr-only">
              Internal investigation note
            </label>
            <textarea
              id="report-internal-note"
              className="mt-3 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              placeholder="Add investigation notes..."
            />
            <MockAction
              label="Save investigation note"
              message="Internal investigation note saved."
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-800">{value}</strong>
    </div>
  );
}
