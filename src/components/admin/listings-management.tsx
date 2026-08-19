"use client";

import { useMemo, useState } from "react";

import { ActionDialog } from "@/components/ui/action-dialog";
import { AdminButton } from "@/components/ui/admin-button";
import { SafeLink } from "@/components/ui/safe-link";
import { StatusBadge } from "@/components/ui/status-badge";
import { categories, listings, type ListingRecord } from "@/data/mock-data";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "./admin-demo-provider";

const listingStatuses = [
  "Published",
  "Draft",
  "Paused",
  "Sold",
  "Expired",
  "Under review",
  "Rejected",
  "Removed",
] as const;

const attentionOptions = [
  { value: "all", label: "All listings" },
  { value: "reports", label: "Has reports" },
  { value: "availability", label: "Availability reports" },
  { value: "promoted", label: "Promoted" },
  { value: "high-risk", label: "High risk" },
] as const;

function getPageItems(page: number, pages: number): Array<number | "ellipsis"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", pages];
  if (page >= pages - 3) return [1, "ellipsis", pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pages];
}

export function ListingsManagement() {
  const { getStatus, setStatus, toast } = useAdminDemo();
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [sellerType, setSellerType] = useState("all");
  const [attention, setAttention] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      listings.map((listing) => ({
        ...listing,
        effectiveStatus: getStatus("listing", listing.id, listing.status),
      })),
    [getStatus],
  );

  const summary = useMemo(() => {
    const published = rows.filter((listing) => listing.effectiveStatus === "Published").length;
    const review = rows.filter((listing) => listing.effectiveStatus === "Under review").length;
    const needsAttention = rows.filter(
      (listing) => listing.reports > 0 || listing.availabilityReports > 0 || listing.risk === "High",
    ).length;
    return { total: rows.length, published, review, needsAttention };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((listing) => {
      const searchable = [
        listing.id,
        listing.title,
        listing.seller,
        listing.category,
        listing.location,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q || searchable.includes(q);
      const matchesStatus = status === "all" || listing.effectiveStatus === status;
      const matchesCategory = category === "all" || listing.categoryId === category;
      const matchesSellerType = sellerType === "all" || listing.sellerType === sellerType;
      const matchesAttention =
        attention === "all" ||
        (attention === "reports" && listing.reports > 0) ||
        (attention === "availability" && listing.availabilityReports > 0) ||
        (attention === "promoted" && listing.promoted) ||
        (attention === "high-risk" && listing.risk === "High");

      return matchesQuery && matchesStatus && matchesCategory && matchesSellerType && matchesAttention;
    });
  }, [rows, query, status, category, sellerType, attention]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const visibleIds = visible.map((listing) => listing.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const activeFilterCount = [status, category, sellerType, attention].filter((value) => value !== "all").length + (query.trim() ? 1 : 0);

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
    setCategory("all");
    setSellerType("all");
    setAttention("all");
    setPage(1);
  }

  function toggleAllVisible() {
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  function toggleRow(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function bulkSetStatus(nextStatus: string, message: string) {
    selected.forEach((id) => setStatus("listing", id, nextStatus));
    toast(message, `${selected.length} listing${selected.length === 1 ? "" : "s"} updated.`);
    setSelected([]);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["All listings", summary.total, "Every lifecycle state"],
          ["Published", summary.published, "Currently visible"],
          ["Under review", summary.review, "Exceptional review cases"],
          ["Needs attention", summary.needsAttention, "Reports, unavailable or high risk"],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <strong className="mt-2 block text-2xl font-black text-slate-950">{value}</strong>
            <p className="mt-1 text-[11px] text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(2,18,47,.03)]" aria-labelledby="all-listings-heading">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 id="all-listings-heading" className="text-base font-black text-slate-950">All marketplace listings</h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Search and manage listings across every seller, category and lifecycle state. Use filters and pagination to manage large marketplace inventories efficiently.
              </p>
            </div>
            <AdminButton variant="outline" onClick={() => toast("Listing export prepared", "The current filtered result set has been prepared for export.", "info")}>
              <Icons.download size={16} /> Export current view
            </AdminButton>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_repeat(4,minmax(150px,.7fr))]">
            <label className="relative block">
              <span className="sr-only">Search listings</span>
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search title, listing ID, seller or location…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  className="absolute right-0 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                  aria-label="Clear listing search"
                >
                  <Icons.close size={15} />
                </button>
              )}
            </label>

            <label>
              <span className="sr-only">Filter listings by status</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              >
                <option value="all">All statuses</option>
                {listingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter listings by category</span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              >
                <option value="all">All categories</option>
                {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter listings by seller type</span>
              <select
                value={sellerType}
                onChange={(event) => {
                  setSellerType(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              >
                <option value="all">All seller types</option>
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
              </select>
            </label>

            <label>
              <span className="sr-only">Filter listings requiring attention</span>
              <select
                value={attention}
                onChange={(event) => {
                  setAttention(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              >
                {attentionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500" role="status" aria-live="polite">
              {filtered.length.toLocaleString()} listing{filtered.length === 1 ? "" : "s"} match the current view.
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-11 rounded-xl px-3 text-xs font-bold text-[#0b63f6] transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
              >
                Clear {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-blue-950" role="status">{selected.length} listing{selected.length === 1 ? "" : "s"} selected</p>
            <div className="flex flex-wrap items-center gap-2">
              <ActionDialog
                trigger={<button type="button" className="min-h-11 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 transition hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500">Move to review</button>}
                title="Move selected listings to review?"
                description="Use this only when reports, risk signals or policy require manual review."
                confirmLabel="Move to review"
                requireReason
                onConfirm={() => bulkSetStatus("Under review", "Listings moved to review")}
              />
              <ActionDialog
                trigger={<button type="button" className="min-h-11 rounded-xl bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500">Remove selected</button>}
                title="Remove selected listings?"
                description="The selected listings will no longer be public. A moderation reason is required."
                confirmLabel="Remove listings"
                tone="danger"
                requireReason
                onConfirm={() => bulkSetStatus("Removed", "Listings removed")}
              />
              <button type="button" onClick={() => setSelected([])} className="min-h-11 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">Clear selection</button>
            </div>
          </div>
        )}

        <div className="table-scroll" role="region" aria-label="All marketplace listings" tabIndex={0}>
          <table className="admin-table min-w-[1180px]">
            <caption className="sr-only">All marketplace listings with seller, category, price, moderation signals and lifecycle status.</caption>
            <thead>
              <tr>
                <th className="w-12" scope="col">
                  <input type="checkbox" className="size-6" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all listings on this page" />
                </th>
                <th scope="col">Listing</th>
                <th scope="col">Seller</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Location</th>
                <th scope="col">Signals</th>
                <th scope="col">Created</th>
                <th scope="col">Status</th>
                <th className="w-16" scope="col"><span className="sr-only">Open listing</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.length ? visible.map((listing) => (
                <tr key={listing.id}>
                  <td>
                    <input type="checkbox" className="size-6" checked={selected.includes(listing.id)} onChange={() => toggleRow(listing.id)} aria-label={`Select ${listing.title}`} />
                  </td>
                  <td>
                    <div className="max-w-[300px]">
                      <div className="truncate font-bold text-slate-950">{listing.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{listing.id}</span>
                        {listing.promoted && <span className="rounded-full bg-orange-50 px-2 py-0.5 font-bold text-orange-700">{listing.promotion}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-800">{listing.seller}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{listing.sellerType}</div>
                  </td>
                  <td>{listing.category}</td>
                  <td><strong className="whitespace-nowrap text-slate-800">{listing.price}</strong></td>
                  <td><span className="max-w-[160px] text-xs text-slate-600">{listing.location}</span></td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {listing.reports > 0 && <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-700">{listing.reports} report{listing.reports === 1 ? "" : "s"}</span>}
                      {listing.availabilityReports > 0 && <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-800">{listing.availabilityReports} unavailable</span>}
                      {listing.risk === "High" && <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-700">High risk</span>}
                      {listing.reports === 0 && listing.availabilityReports === 0 && listing.risk !== "High" && <span className="text-xs text-slate-400">Clear</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-xs text-slate-500">{listing.created}</td>
                  <td><StatusBadge status={listing.effectiveStatus} /></td>
                  <td>
                    <SafeLink href={`/listings/${listing.id}`} aria-label={`Open ${listing.title}`} className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">
                      <Icons.chevronRight size={16} />
                    </SafeLink>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10}>
                    <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
                      <div>
                        <span className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400"><Icons.search size={20} /></span>
                        <h3 className="mt-4 text-sm font-black text-slate-800">No listings match these filters</h3>
                        <p className="mt-1 text-xs text-slate-500">Clear one or more filters to widen the marketplace inventory view.</p>
                        <button type="button" onClick={resetFilters} className="mt-4 min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6]">Reset filters</button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span aria-live="polite">Showing {filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)} of {filtered.length.toLocaleString()} results</span>
            <label className="flex items-center gap-2">
              <span>Rows</span>
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-700 outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10" aria-label="Listings per page">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
          </div>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Listings pagination">
            <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="min-h-11 rounded-xl border border-slate-200 px-3 font-bold transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            {getPageItems(currentPage, pages).map((item, index) => item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="grid min-h-11 min-w-8 place-items-center" aria-hidden="true">…</span>
            ) : (
              <button key={item} type="button" onClick={() => setPage(item)} aria-current={item === currentPage ? "page" : undefined} aria-label={`Page ${item}`} className={`min-h-11 min-w-11 rounded-xl px-3 font-bold transition focus-visible:ring-2 focus-visible:ring-[#0b63f6] ${item === currentPage ? "bg-[#02122f] text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}>{item}</button>
            ))}
            <button type="button" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)} className="min-h-11 rounded-xl border border-slate-200 px-3 font-bold transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </nav>
        </div>
      </section>
    </div>
  );
}

export type AdminListingRow = ListingRecord & { effectiveStatus: string };
