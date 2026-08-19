import { SafeLink } from "@/components/ui/safe-link";
import { sellers, listings } from "@/data/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions } from "@/components/admin/entity-actions";
import { MarketplaceImage } from "@/components/admin/marketplace-image";
import { Icons } from "@/lib/icons";
import { PublicSellerLink } from "@/components/admin/public-marketplace-link";

export default async function SellerPage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  const seller = sellers.find((item) => item.id === sellerId) ?? sellers[0];

  if (!seller) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-lg font-black">Seller unavailable</h1><SafeLink href="/sellers" className="mt-4 inline-flex text-sm font-bold text-emerald-700">Back to sellers</SafeLink></div>;
  }

  const sellerListings = listings.filter((listing) => listing.publicSellerId === seller.publicSellerId);

  return (
    <div className="space-y-6">
      <SafeLink href="/sellers" className="text-xs font-bold text-slate-500">← Back to sellers</SafeLink>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MarketplaceImage src={seller.avatar} alt={`${seller.name} profile image`} className="size-12 shrink-0 rounded-full border border-slate-200 object-cover" fallbackClassName="size-12 shrink-0 rounded-full border border-slate-200" />
          <div>
            <div className="flex items-center gap-2"><h1 className="text-xl font-black">{seller.name}</h1><LiveStatusBadge kind="seller" id={seller.id} status={seller.status} /></div>
            <p className="mt-1 text-xs text-slate-500">{seller.owner} · {seller.id} · {seller.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2"><PublicSellerLink sellerId={seller.id} sellerName={seller.name} /><EntityActions kind="seller" id={seller.id} name={seller.name} status={seller.status} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Current plan", seller.plan], ["Active listings", String(sellerListings.length)], ["Seller rating", seller.rating === "—" ? "—" : `${seller.rating} / 5`], ["Plan revenue", seller.revenue]].map(([label, value]) => <div className="rounded-xl border border-slate-200 bg-white p-4" key={label}><p className="text-xs text-slate-500">{label}</p><strong className="mt-2 block text-xl font-black">{value}</strong></div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="px-5 py-4"><h2 className="text-sm font-black">Seller listings</h2><p className="mt-0.5 text-xs text-slate-500">Listings owned by this marketplace seller</p></div>
          <div className="table-scroll">
            <table className="admin-table" aria-label={`${seller.name} listings`}>
              <thead><tr><th scope="col">Listing</th><th scope="col">Price</th><th scope="col">Status</th><th scope="col" /></tr></thead>
              <tbody>
                {sellerListings.map((listing) => (
                  <tr key={listing.id}>
                    <td><div className="flex items-center gap-3"><MarketplaceImage src={listing.image} alt={`${listing.title} thumbnail`} className="size-10 shrink-0 rounded-lg object-cover" fallbackClassName="size-10 shrink-0 rounded-lg" /><div><div className="font-bold text-slate-900">{listing.title}</div><div className="text-[10px] text-slate-400">{listing.id}</div></div></div></td>
                    <td>{listing.price}</td><td><StatusBadge status={listing.status} /></td><td><SafeLink href={`/listings/${listing.id}`} className="text-emerald-700" aria-label={`View ${listing.title}`}><Icons.chevronRight size={16} /></SafeLink></td>
                  </tr>
                ))}
                {sellerListings.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-sm text-slate-500">No listings are associated with this seller in the current marketplace catalog.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-black">Seller details</h2><div className="mt-4 space-y-4 text-xs"><Row label="Owner" value={seller.owner} /><Row label="Joined" value={seller.joined} /><Row label="Location" value={seller.location} /><Row label="Verification" value={seller.status} /><Row label="Public seller ID" value={seller.publicSellerId} /></div></section>
          <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-black"><Icons.shield size={17} className="text-emerald-600" />Trust & safety</div><p className="mt-3 text-xs leading-5 text-slate-500">Review reports and enforcement history before taking action on seller access.</p></section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><span className="text-slate-500">{label}</span><strong className="max-w-[65%] break-words text-right text-slate-800">{value}</strong></div>;
}
