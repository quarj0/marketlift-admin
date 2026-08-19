"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { listings, promotionProducts } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

const iconCycle = [Icons.arrowUp, Icons.megaphone, Icons.dashboard];

export default function PromotionsPage() {
  const [open, setOpen] = useState(false);
  const { toast } = useAdminDemo();
  const promotionRows = listings.slice(0, Math.min(6, listings.length)).map((listing, index) => {
    const product = promotionProducts[index % Math.max(promotionProducts.length, 1)];
    return {
      id: `PRM-${882 - index}`,
      listing: listing.title,
      seller: listing.seller,
      type: product?.name ?? "Promotion",
      spend: product?.price ?? "R$ —",
      views: `${Math.max(1, 18 - index * 2)}.${index + 2}k`,
      ends: `${21 - (index % 7)} Aug`,
      status: index === 5 ? "Expired" : "Active",
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Monitor the same paid visibility products offered to marketplace sellers."
        actions={<AdminButton onClick={() => setOpen(true)}>+ Create campaign</AdminButton>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {promotionProducts.map((product, index) => {
          const Icon = iconCycle[index % iconCycle.length];
          return (
            <Promo
              key={product.id || product.name}
              title={product.name}
              price={product.price}
              description={product.description || (product.duration ? `Promotion duration: ${product.duration}` : "Marketplace visibility product.")}
              icon={<Icon size={20} />}
              onClick={() => setOpen(true)}
            />
          );
        })}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="px-5 py-4"><h2 className="text-sm font-black">Active & recent promotions</h2></div>
        <div className="table-scroll">
          <table className="admin-table" aria-label="Active and recent promotions">
            <thead><tr><th scope="col">Promotion</th><th scope="col">Listing</th><th scope="col">Seller</th><th scope="col">Type</th><th scope="col">Spend</th><th scope="col">Views</th><th scope="col">Ends</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {promotionRows.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="font-bold">{promotion.id}</td>
                  <td className="font-semibold text-slate-800">{promotion.listing}</td>
                  <td>{promotion.seller}</td>
                  <td>{promotion.type}</td>
                  <td>{promotion.spend}</td>
                  <td>{promotion.views}</td>
                  <td>{promotion.ends}</td>
                  <td><StatusBadge status={promotion.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create promotion campaign"
        description="Select a marketplace promotion product and listing for the campaign."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={() => { toast("Campaign prepared", "Promotion campaign configuration saved in the administration preview."); setOpen(false); }}>Create campaign</AdminButton>
          </>
        }
      >
        <div className="grid gap-4">
          <label>
            <span className="mb-2 block text-xs font-bold text-slate-700">Promotion product</span>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10">
              {promotionProducts.map((product) => <option key={product.id || product.name}>{product.name} · {product.price}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs font-bold text-slate-700">Listing</span>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10">
              {listings.map((listing) => <option key={listing.id}>{listing.title} · {listing.seller}</option>)}
            </select>
          </label>
        </div>
      </Dialog>
    </div>
  );
}

function Promo({ title, price, description, icon, onClick }: { title: string; price: string; description: string; icon: ReactNode; onClick: () => void }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700" aria-hidden="true">{icon}</span>
        <strong className="text-lg font-black text-slate-950">{price}</strong>
      </div>
      <h2 className="mt-4 text-sm font-black text-slate-900">{title}</h2>
      <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{description}</p>
      <button type="button" onClick={onClick} className="mt-4 text-xs font-black text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Create campaign</button>
    </article>
  );
}
