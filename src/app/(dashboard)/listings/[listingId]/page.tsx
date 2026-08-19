import { notFound } from "next/navigation";

import { EntityActions, MockAction } from "@/components/admin/entity-actions";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { SafeLink } from "@/components/ui/safe-link";
import { listings } from "@/data/mock-data";
import { Icons } from "@/lib/icons";

export default async function ListingDetailPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const listing = listings.find((item) => item.id === listingId);

  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <SafeLink href="/listings" className="inline-flex min-h-11 items-center text-xs font-bold text-slate-500 hover:text-[#0b63f6] focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
        ← Back to all listings
      </SafeLink>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-black text-slate-950">{listing.title}</h1>
            <LiveStatusBadge kind="listing" id={listing.id} status={listing.status} />
            {listing.promoted && (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-black text-orange-700 ring-1 ring-inset ring-orange-600/20">
                {listing.promotion}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {listing.id} · {listing.seller} · {listing.location} · {listing.created}
          </p>
        </div>
        <EntityActions kind="listing" id={listing.id} name={listing.title} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 sm:col-span-2"
                role="img"
                aria-label={`Cover image placeholder for ${listing.title}`}
              >
                <div className="absolute inset-0 grid place-items-center text-slate-400">
                  <Icons.image size={42} />
                </div>
                <span className="absolute bottom-3 left-3 rounded-lg bg-[#02122f]/80 px-2 py-1 text-[10px] font-bold text-white">
                  Cover image
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                <div className="grid min-h-28 place-items-center rounded-2xl bg-slate-100 text-slate-400" role="img" aria-label="Additional listing image placeholder">
                  <Icons.image size={24} />
                </div>
                <div className="grid min-h-28 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                  <span className="text-xs font-black">{listing.photos} photos</span>
                </div>
              </div>
            </div>

            <h2 className="mt-5 text-sm font-black">Listing description</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{listing.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Views" value={listing.views.toLocaleString()} />
              <Metric label="Saves" value={listing.saves.toLocaleString()} />
              <Metric label="Risk" value={listing.risk} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black">Moderation & availability signals</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Signals help administrators investigate exceptions without turning every listing into an approval workflow.</p>
              </div>
              {(listing.reports > 0 || listing.availabilityReports > 0) && (
                <SafeLink href="/reports" className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-bold text-[#0b63f6] hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                  Open reports
                </SafeLink>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icons.check size={15} /></span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Automated content checks completed</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Ordinary listings can publish after automated validation.</p>
                </div>
              </div>

              {listing.reports > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-700"><Icons.alert size={15} /></span>
                  <div>
                    <p className="text-xs font-bold text-red-950">{listing.reports} marketplace report{listing.reports === 1 ? "" : "s"}</p>
                    <p className="mt-0.5 text-[10px] text-red-700">Review the report reason and evidence before enforcement.</p>
                  </div>
                </div>
              )}

              {listing.availabilityReports > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800"><Icons.clock size={15} /></span>
                  <div>
                    <p className="text-xs font-bold text-amber-950">{listing.availabilityReports} availability report{listing.availabilityReports === 1 ? "" : "s"}</p>
                    <p className="mt-0.5 text-[10px] text-amber-800">A buyer says the seller indicated this item may no longer be available. A single report does not automatically remove the listing.</p>
                  </div>
                </div>
              )}

              {listing.reports === 0 && listing.availabilityReports === 0 && (
                <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No current user-generated moderation signals for this listing.</div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Listing details</h2>
            <div className="mt-4 space-y-4 text-xs">
              <Row label="Price" value={listing.price} />
              <Row label="Category" value={listing.category} />
              <Row label="Category ID" value={listing.categoryId} />
              <Row label="Seller" value={listing.seller} />
              <Row label="Seller type" value={listing.sellerType} />
              <Row label="Location" value={listing.location} />
              <Row label="Condition" value={listing.condition} />
              <Row label="Lifecycle status" value={listing.status} />
              <Row label="Promotion" value={listing.promotion ?? "None"} />
              <Row label="Reports" value={String(listing.reports)} />
              <Row label="Unavailable reports" value={String(listing.availabilityReports)} />
              <Row label="Last updated" value={listing.updated} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Investigation tools</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Use moderation only when reports, risk signals or category policy justify it.</p>
            <div className="mt-3 grid gap-2">
              <MockAction label="Inspect related reports" message="Related report history opened in the mock admin experience." />
              <MockAction label="Contact seller" message="Open the seller-contact workflow for this listing." />
              <MockAction label="Open category policy" message={`${listing.category} schema and policy configuration opened.`} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <strong className="max-w-[60%] text-right text-slate-800">{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}
