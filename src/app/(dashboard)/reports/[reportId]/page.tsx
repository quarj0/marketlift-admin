import { SafeLink } from "@/components/ui/safe-link";
import { reports } from "@/data/mock-data";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions, MockAction } from "@/components/admin/entity-actions";
import { Icons } from "@/lib/icons";

const statements: Record<string, string> = {
  "Item reported unavailable": "The seller told me the item was already sold or is no longer available, but the listing is still live.",
  "Suspected fraud": "The seller asked me to make a payment before I could inspect the item and the details did not match what I was shown.",
  "Counterfeit goods": "The product appears to be presented as authentic, but the branding and information look inconsistent.",
  "Incorrect information": "The details the seller gave me do not match the information shown in the listing.",
  "Spam messages": "I received repeated unwanted marketplace messages from this user.",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const report = reports.find((item) => item.id === reportId) ?? reports[0];
  const isAvailabilityReport = report.reason === "Item reported unavailable";

  return (
    <div className="space-y-6">
      <SafeLink href="/reports" className="text-xs font-bold text-slate-500 hover:text-[#0b63f6]">
        ← Back to reports
      </SafeLink>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black">{report.id}</h1>
            <LiveStatusBadge kind="report" id={report.id} status={report.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{report.reason} · {report.created}</p>
        </div>
        <EntityActions kind="report" id={report.id} name={report.target} />
      </div>

      {isAvailabilityReport && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-xs leading-5 text-orange-950">
          <strong>Do not remove this listing from a single report alone.</strong> Confirm with the seller or combine this signal with repeated independent reports and moderation policy before changing availability.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Reported content</h2>
            <div className="mt-4 rounded-2xl bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{report.type}</p>
              <h3 className="mt-2 text-base font-black text-slate-900">{report.target}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Inspect the original content, seller history, messages and previous reports before deciding whether enforcement is appropriate.
              </p>
              <SafeLink
                href={report.type === "Listing" ? "/listings" : report.type === "Seller" ? "/sellers" : "/users"}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-xs font-black text-[#0b63f6] transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
              >
                <Icons.external size={14} /> Find original content
              </SafeLink>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Reporter statement</h2>
            <blockquote className="mt-4 rounded-xl border-l-4 border-[#ff8a00] bg-orange-50/60 p-4 text-xs leading-6 text-slate-700">
              “{statements[report.reason] ?? "The reporter asked Marketlift to review this marketplace activity."}”
            </blockquote>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Report details</h2>
            <div className="mt-4 space-y-4 text-xs">
              <Row label="Reporter" value={report.reporter} />
              <Row label="Reason" value={report.reason} />
              <Row label="Priority" value={report.priority} />
              <Row label="Target type" value={report.type} />
              <Row label="Created" value={report.created} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <label htmlFor="report-note" className="text-sm font-black">Internal note</label>
            <textarea
              id="report-note"
              className="mt-3 min-h-28 w-full resize-y rounded-xl border border-slate-200 p-3 text-xs outline-none transition focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              placeholder="Add investigation notes..."
            />
            <div className="mt-3">
              <MockAction label="Save investigation note" message="Internal note saved in the UI investigation experience." />
            </div>
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
