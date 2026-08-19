"use client";

import { useMemo, useState, type ReactNode } from "react";
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

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || searchText(row).toLowerCase().includes(q);
        const matchesStatus = status === "all" || !statusOf || statusOf(row) === status;
        return matchesQuery && matchesStatus;
      }),
    [rows, query, status, searchText, statusOf],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const visibleIds = visible.map((row) => row.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleAll = () =>
    setSelected((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(2,18,47,.03)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full xl:max-w-md">
          <span className="sr-only">Search table</span>
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
            placeholder={searchPlaceholder}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              className="absolute right-0 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
              aria-label="Clear search"
            >
              <Icons.close size={15} />
            </button>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {statuses.length > 0 && (
            <AdminSelect
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </AdminSelect>
          )}
          {secondaryFilter}
          <AdminSelect
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            aria-label="Rows per page"
          >
            <option value="5">5 / page</option>
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
          </AdminSelect>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-col gap-2 border-b border-blue-100 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-blue-950" role="status">
            {selected.length} {selectedLabel} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions?.(selected, () => setSelected([]))}
            <button
              type="button"
              onClick={() => setSelected([])}
              className="min-h-11 rounded-xl px-3 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      <div
        className="table-scroll"
        role="region"
        aria-label="Results table"
        tabIndex={0}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10" scope="col">
                <input
                  aria-label="Select all visible rows"
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  className="size-6"
                />
              </th>
              {columns.map((column) => (
                <th key={column.key} className={column.className} scope="col">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      aria-label={`Select ${row.id}`}
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggle(row.id)}
                      className="size-6"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className={column.className}>{column.cell(row)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1}>
                  <div className="grid min-h-48 place-items-center py-8 text-center">
                    <div>
                      <span className="mx-auto grid size-10 place-items-center rounded-full bg-slate-100 text-slate-400">
                        <Icons.search size={18} />
                      </span>
                      <p className="mt-3 text-sm font-black text-slate-700">No results found</p>
                      <p className="mt-1 text-xs text-slate-400">Try another search or clear the status filter.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        pages={pages}
        count={filtered.length}
        from={filtered.length ? start + 1 : 0}
        to={Math.min(start + pageSize, filtered.length)}
        onPage={setPage}
      />
    </div>
  );
}
