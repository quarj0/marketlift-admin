"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { promotionProducts } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

const promotions = [
  { id: "PRM-882", listing: "iPhone 16 Pro Max 256GB", seller: "TechZone Brasil", type: "Featured", spend: "R$ 19,90", views: "18,4k", ends: "21 Aug", status: "Active" },
  { id: "PRM-881", listing: "Toyota Hilux SRX 2025", seller: "AutoMax Veículos", type: "Homepage Featured", spend: "R$ 29,90", views: "31,2k", ends: "20 Aug", status: "Active" },
  { id: "PRM-880", listing: "Galaxy S26 Ultra", seller: "Mundo Mobile", type: "Top of Search", spend: "R$ 14,90", views: "7,8k", ends: "19 Aug", status: "Active" },
  { id: "PRM-879", listing: "Apartamento 2 quartos", seller: "Imóveis Prime", type: "Urgent", spend: "R$ 9,90", views: "12,1k", ends: "17 Aug", status: "Expired" },
];

export default function PromotionsPage() {
  const [open, setOpen] = useState(false);
  const { toast } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Monitor the same Featured, Top of Search, Urgent and Homepage Featured products available to sellers."
        actions={<AdminButton variant="accent" onClick={() => setOpen(true)}>+ Create promotion</AdminButton>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {promotionProducts.map((product) => (
          <Promo
            key={product.id}
            title={product.name}
            price={product.price}
            duration={product.duration}
            description={product.description}
            icon={<PromotionIcon id={product.id} />}
            onClick={() => setOpen(true)}
          />
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="px-5 py-4">
          <h2 className="text-sm font-black">Active & recent promotions</h2>
          <p className="mt-1 text-xs text-slate-500">Promotion purchases are Marketlift service fees only; product payments remain between buyer and seller.</p>
        </div>
        <div className="table-scroll" role="region" aria-label="Active and recent promotions" tabIndex={0}>
          <table className="admin-table">
            <thead><tr><th scope="col">Promotion</th><th scope="col">Listing</th><th scope="col">Selling profile</th><th scope="col">Type</th><th scope="col">Spend</th><th scope="col">Views</th><th scope="col">Ends</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {promotions.map((promotion) => (
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
        title="Create promotion"
        description="Create a Marketlift service promotion for an eligible listing."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton
              variant="accent"
              onClick={() => {
                toast("Promotion created", "Mock promotion is ready for review.");
                setOpen(false);
              }}
            >
              Create promotion
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Listing ID" placeholder="LST-9012" />
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-700">Promotion product</span>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10">
              {promotionProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.price} · {product.duration}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Dialog>
    </div>
  );
}

function PromotionIcon({ id }: { id: string }) {
  if (id === "featured") return <Icons.megaphone size={20} />;
  if (id === "top_search") return <Icons.arrowUp size={20} />;
  if (id === "homepage") return <Icons.dashboard size={20} />;
  return <Icons.alert size={20} />;
}

function Promo({
  title,
  price,
  duration,
  description,
  icon,
  onClick,
}: {
  title: string;
  price: string;
  duration: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#02122f]/5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-[#ff8a00]/12 text-[#b85e00]">{icon}</span>
        <div>
          <h2 className="text-sm font-black">{title}</h2>
          <p className="text-xs font-black text-[#0b63f6]">{price} · {duration}</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p>
      <button type="button" onClick={onClick} className="mt-4 min-h-11 rounded-xl px-3 text-xs font-black text-[#0b63f6] transition hover:bg-blue-50 hover:text-[#0958dc] focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
        Configure →
      </button>
    </article>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700">{label}</span>
      <input
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
      />
    </label>
  );
}
