"use client";

import { useState } from "react";
import { categories as initial } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { Dialog } from "@/components/ui/dialog";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useAdminDemo();

  const toggle = (slug: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.slug === slug ? { ...category, active: !category.active } : category,
      ),
    );
    toast("Category updated", "Marketplace visibility changed in this browser demo.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage the 13 consumer marketplace categories and their stable backend IDs."
        actions={<AdminButton onClick={() => setOpen(true)}>+ Add category</AdminButton>}
      />

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-950">
        Category IDs are API contracts. Renaming a display label should not silently change the stable ID used by listings and category schemas.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <article
            key={category.slug}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#02122f]/5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-xl" aria-hidden="true">
                {category.icon}
              </span>
              <button
                type="button"
                onClick={() => toggle(category.slug)}
                aria-pressed={category.active}
                className="min-h-11 rounded-xl border border-slate-200 px-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
              >
                {category.active ? "Hide" : "Show"}
              </button>
            </div>

            <h2 className="mt-4 text-sm font-black text-slate-900">{category.name}</h2>
            <p className="mt-1 font-mono text-[11px] text-slate-400">{category.slug}</p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-[10px] text-slate-400">Listings</p>
                <strong className="text-sm text-slate-800">{category.listings.toLocaleString("pt-BR")}</strong>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                  category.active
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {category.active ? "Visible" : "Hidden"}
              </span>
            </div>
          </article>
        ))}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add category"
        description="Create a new top-level category only when the consumer marketplace and backend schema will support it."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton
              disabled={name.trim().length < 2}
              onClick={() => {
                const clean = name.trim();
                setCategories((current) => [
                  ...current,
                  {
                    name: clean,
                    slug: clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                    listings: 0,
                    active: false,
                    icon: "📦",
                  },
                ]);
                setName("");
                setOpen(false);
                toast("Category drafted", `${clean} was added hidden until its schema is configured.`);
              }}
            >
              Create hidden category
            </AdminButton>
          </>
        }
      >
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-slate-700">Category name</span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
            placeholder="e.g. Sports & Outdoors"
          />
        </label>
      </Dialog>
    </div>
  );
}
