import { SafeLink } from "@/components/ui/safe-link";
import { listings } from "@/data/mock-data";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions, MockAction, MoveListingToReviewAction } from "@/components/admin/entity-actions";
import { MarketplaceImage } from "@/components/admin/marketplace-image";
import { Icons } from "@/lib/icons";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const listing = listings.find((item) => item.id === listingId) ?? listings[0];

  if (!listing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-lg font-black text-slate-950">Listing unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">This listing is not present in the current marketplace catalog.</p>
        <SafeLink href="/listings" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Back to listings</SafeLink>
      </div>
    );
  }

  const gallery = listing.images.length ? listing.images : listing.image ? [listing.image] : [];

  return (
    <div className="space-y-6">
      <SafeLink href="/listings" className="text-xs font-bold text-slate-500">← Back to listings</SafeLink>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black text-slate-950">{listing.title}</h1>
            <LiveStatusBadge kind="listing" id={listing.id} status={listing.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{listing.id} · Listed by {listing.seller} · {listing.created}</p>
        </div>
        <EntityActions kind="listing" id={listing.id} name={listing.title} status={listing.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            {gallery.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 sm:col-span-2">
                  <MarketplaceImage
                    src={gallery[0]}
                    alt={`${listing.title}, cover image`}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                  />
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2 py-1 text-[10px] font-bold text-white">Cover image</span>
                </div>
                <div className="grid min-h-40 grid-cols-2 gap-3 sm:grid-cols-1">
                  {gallery.slice(1, 3).map((image, index) => (
                    <div key={`${image}-${index}`} className="relative min-h-24 overflow-hidden rounded-xl bg-slate-100">
                      <MarketplaceImage
                        src={image}
                        alt={`${listing.title}, image ${index + 2}`}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                      />
                    </div>
                  ))}
                  {gallery.length > 3 && (
                    <div className="grid min-h-20 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <span className="text-xs font-black">+{gallery.length - 3} photos</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid aspect-[16/7] place-items-center rounded-xl bg-slate-100 text-slate-400" role="img" aria-label={`${listing.title} image unavailable`}>
                <Icons.image size={42} aria-hidden="true" />
              </div>
            )}

            <h2 className="mt-5 text-sm font-black">Listing description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {listing.description || "No description was provided for this listing."}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Moderation history</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icons.check size={15} /></span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Marketplace content received</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">The administrator view reflects the seller-provided public listing.</p>
                </div>
              </div>
              {listing.reports > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
                  <span className="grid size-8 place-items-center rounded-full bg-red-100 text-red-700"><Icons.alert size={15} /></span>
                  <div>
                    <p className="text-xs font-bold text-red-800">{listing.reports} user reports received</p>
                    <p className="mt-0.5 text-[10px] text-red-500">Sent to manual review queue</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Listing details</h2>
            <div className="mt-4 space-y-4 text-xs">
              <Row label="Price" value={listing.price} />
              <Row label="Category" value={listing.category} />
              <Row label="Seller" value={listing.seller} />
              <Row label="Condition" value={listing.condition} />
              <Row label="Location" value={listing.location} />
              <Row label="Reports" value={String(listing.reports)} />
              <Row label="Public slug" value={listing.publicSlug} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Quick actions</h2>
            <div className="mt-3 grid gap-2">
              <MoveListingToReviewAction id={listing.id} status={listing.status} />
              <MockAction label="Contact seller" message="A seller contact workflow was opened for this listing." />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-slate-500">{label}</span><strong className="max-w-[65%] break-words text-right text-slate-800">{value}</strong></div>;
}
