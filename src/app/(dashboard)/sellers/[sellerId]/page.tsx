import { SafeLink } from "@/components/ui/safe-link";
import { sellers, listings } from "@/data/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions } from "@/components/admin/entity-actions";
import { Icons } from "@/lib/icons";

export default async function SellerPage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  const seller = sellers.find((item) => item.id === sellerId) ?? sellers[0];
  const sellerListings = listings.filter((listing) => listing.seller === seller.name);

  return (
    <div className="space-y-6">
      <SafeLink href="/sellers" className="inline-flex min-h-11 items-center rounded-xl px-2 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-[#0b63f6] focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
        ← Back to selling profiles
      </SafeLink>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black">{seller.name}</h1>
            <LiveStatusBadge kind="seller" id={seller.id} status={seller.status} />
            <StatusBadge status={seller.verification} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Selling profile for {seller.owner} · {seller.id} · {seller.location}</p>
        </div>
        <EntityActions kind="seller" id={seller.id} name={seller.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Current plan", seller.plan],
          ["Active listings", String(seller.listings)],
          ["Seller rating", `${seller.rating} / 5`],
          ["Monthly plan fee", seller.revenue],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-slate-200 bg-white p-4" key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <strong className="mt-2 block text-xl font-black">{value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="px-5 py-4">
            <h2 className="text-sm font-black">Recent listings</h2>
          </div>
          <div className="table-scroll" role="region" aria-label={`Recent listings for ${seller.name}`} tabIndex={0}>
            <table className="admin-table">
              <thead><tr><th scope="col">Listing</th><th scope="col">Price</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {(sellerListings.length ? sellerListings : listings.slice(0, 4)).map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <div className="font-bold text-slate-900">{listing.title}</div>
                      <div className="text-[10px] text-slate-400">{listing.id}</div>
                    </td>
                    <td>{listing.price}</td>
                    <td><StatusBadge status={listing.status} /></td>
                    <td>
                      <SafeLink href={`/listings/${listing.id}`} aria-label={`View ${listing.title}`} className="grid size-11 place-items-center rounded-xl text-[#0b63f6] transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                        <Icons.chevronRight size={16} />
                      </SafeLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Selling profile details</h2>
            <div className="mt-4 space-y-4 text-xs">
              <Row label="Account owner" value={seller.owner} />
              <Row label="Selling enabled" value="Yes" />
              <Row label="Joined" value={seller.joined} />
              <Row label="Location" value={seller.location} />
              <Row label="Verification" value={seller.verification} />
              <Row label="Response rate" value="96%" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-black">
              <Icons.shield size={17} className="text-emerald-600" /> Trust & safety
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Verification is a trust signal, not a guarantee. Selling access and the underlying user account are controlled independently.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-800">{value}</strong>
    </div>
  );
}
