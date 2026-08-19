"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { Icons } from "@/lib/icons";
import { AdminSelect } from "./select";
import { Pagination } from "./pagination";

type Column<T> = { key: string; label: string; cell: (row: T) => ReactNode; className?: string };

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchText,
  searchPlaceholder = "Search…",
  statusOf,
  statuses = [],
  secondaryFilter,
  selectedLabel = "items",
  bulkActions,
}: {
  rows: T[];
  columns: Column<T>[];
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  statusOf?: (row: T) => string;
  statuses?: string[];
  secondaryFilter?: ReactNode;
  selectedLabel?: string;
  bulkActions?: (selected: string[], clear: () => void) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const searchId = useId();

  const filtered = useMemo(() => rows.filter((row) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || searchText(row).toLowerCase().includes(q);
    const matchesStatus = status === "all" || !statusOf || statusOf(row) === status;
    return matchesQuery && matchesStatus;
  }), [rows, query, status, searchText, statusOf]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const visibleIds = visible.map((row) => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selected.includes(id)) && !allVisibleSelected;

  const toggleAll = () => setSelected((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])));
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.02)]">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-md">
        <label htmlFor={searchId} className="sr-only">Search {selectedLabel}</label>
        <Icons.search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/>
        <input id={searchId} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20" placeholder={searchPlaceholder}/>
        {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }} className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={`Clear ${selectedLabel} search`}><Icons.close size={15}/></button>}
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-label={`${selectedLabel} filters`}>
        {statuses.length > 0 && <AdminSelect value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label={`Filter ${selectedLabel} by status`}><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</AdminSelect>}
        {secondaryFilter}
        <AdminSelect value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label={`Rows per page for ${selectedLabel}`}><option value="5">5 / page</option><option value="10">10 / page</option><option value="25">25 / page</option></AdminSelect>
      </div>
    </div>

    {selected.length > 0 && <div className="flex flex-col gap-2 border-b border-emerald-100 bg-emerald-50/60 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
      <p className="text-xs font-bold text-emerald-950">{selected.length} {selectedLabel} selected</p>
      <div className="flex flex-wrap items-center gap-2">{bulkActions?.(selected, () => setSelected([]))}<button type="button" onClick={() => setSelected([])} className="rounded-md px-2 py-1 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900">Clear selection</button></div>
    </div>}

    <div className="table-scroll">
      <table className="admin-table" aria-label={`${selectedLabel} results`}>
        <thead><tr>
          <th scope="col" className="w-10">
            <input
              aria-label={`Select all visible ${selectedLabel}`}
              aria-checked={someVisibleSelected ? "mixed" : allVisibleSelected}
              type="checkbox"
              checked={allVisibleSelected}
              ref={(node) => { if (node) node.indeterminate = someVisibleSelected; }}
              onChange={toggleAll}
              className="size-4 accent-emerald-600"
            />
          </th>
          {columns.map((column) => <th scope="col" key={column.key} className={column.className}>{column.label || <span className="sr-only">Actions</span>}</th>)}
        </tr></thead>
        <tbody>{visible.length ? visible.map((row) => <tr key={row.id}>
          <td><input aria-label={`Select ${row.id}`} type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} className="size-4 accent-emerald-600"/></td>
          {columns.map((column) => <td key={column.key} className={column.className}>{column.cell(row)}</td>)}
        </tr>) : <tr><td colSpan={columns.length + 1}><div className="grid min-h-48 place-items-center py-8 text-center" role="status"><div><span className="mx-auto grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500"><Icons.search size={18} aria-hidden="true"/></span><p className="mt-3 text-sm font-black text-slate-800">No results found</p><p className="mt-1 text-xs text-slate-500">Try another search or clear the status filter.</p></div></div></td></tr>}</tbody>
      </table>
    </div>
    <Pagination page={currentPage} pages={pages} count={filtered.length} from={start + 1} to={Math.min(start + pageSize, filtered.length)} onPage={setPage}/>
  </div>;
}
