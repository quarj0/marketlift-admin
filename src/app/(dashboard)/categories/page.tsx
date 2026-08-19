"use client";

import { useState } from "react";
import { categories as initial } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { Dialog } from "@/components/ui/dialog";
import { ActionDialog } from "@/components/ui/action-dialog";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";
import { Icons } from "@/lib/icons";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast, isCategoryDeleted, deleteCategory } = useAdminDemo();
  const visibleCategories = categories.filter((category) => !isCategoryDeleted(category.slug));

  const toggle = (slug: string) => {
    setCategories((current) => current.map((category) => category.slug === slug ? { ...category, active: !category.active } : category));
    toast("Category visibility updated", "The catalog reflects the new visibility state.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage the same category and subcategory structure used by the public marketplace."
        actions={<AdminButton onClick={() => setOpen(true)}>+ Add category</AdminButton>}
      />

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-xs leading-5 text-emerald-900">
        Category names, slugs and subcategories use the marketplace taxonomy. Visibility is reversible; deletion is permanent and requires confirmation.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCategories.map((category) => (
          <article key={category.slug} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-xl" aria-hidden="true">{category.icon}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggle(category.slug)}
                  aria-pressed={!category.active}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  {category.active ? "Hide" : "Show"}
                </button>
                <ActionDialog
                  trigger={<button type="button" aria-label={`Delete ${category.name} permanently`} className="grid size-8 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"><Icons.trash size={14} aria-hidden="true" /></button>}
                  title={`Delete ${category.name} permanently?`}
                  description={category.listings > 0 ? `This category currently contains ${category.listings.toLocaleString("pt-BR")} listing${category.listings === 1 ? "" : "s"}. Deletion is permanent and affected listings will require category reassignment.` : "Deletion is permanent. The category and its subcategory structure will be removed."}
                  confirmLabel="Delete category"
                  tone="danger"
                  requireReason
                  minReasonLength={10}
                  reasonLabel="Deletion reason"
                  reasonHelp="This reason is retained with the category deletion record."
                  onConfirm={() => deleteCategory(category.slug, category.name)}
                />
              </div>
            </div>

            <h2 className="mt-4 text-sm font-black text-slate-900">{category.name}</h2>
            <p className="mt-1 text-[11px] text-slate-400">/{category.slug}</p>

            {category.subcategories.length > 0 && (
              <div className="mt-4" aria-label={`${category.name} subcategories`}>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Subcategories</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {category.subcategories.slice(0, 6).map((subcategory) => (
                    <span key={subcategory.id} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                      {subcategory.name}
                    </span>
                  ))}
                  {category.subcategories.length > 6 && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">+{category.subcategories.length - 6}</span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-[10px] text-slate-400">Listings</p>
                <strong className="text-sm text-slate-800">{category.listings.toLocaleString("pt-BR")}</strong>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${category.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {category.active ? "Active" : "Hidden"}
              </span>
            </div>
          </article>
        ))}
      </div>

      {visibleCategories.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-sm font-black text-slate-800">No categories available</p><p className="mt-1 text-xs text-slate-500">Create a category to rebuild the marketplace taxonomy.</p></div>}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add category"
        description="Create a new top-level marketplace category."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton
              disabled={name.trim().length < 2}
              onClick={() => {
                const clean = name.trim();
                const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                if (categories.some((category) => category.slug === slug) || isCategoryDeleted(slug)) {
                  toast("Category name unavailable", "Use a different category name or slug.", "danger");
                  return;
                }
                setCategories((current) => [...current, {
                  id: slug,
                  name: clean,
                  slug,
                  listings: 0,
                  active: true,
                  icon: "📦",
                  subcategories: [],
                }]);
                setName("");
                setOpen(false);
                toast("Category created", `${clean} is now available in the administration catalog.`);
              }}
            >
              Create category
            </AdminButton>
          </>
        }
      >
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-slate-700">Category name</span>
          <input
            data-dialog-autofocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            placeholder="e.g. Sports & Outdoors"
          />
        </label>
      </Dialog>
    </div>
  );
}
