"use client";

function pageItems(page: number, pages: number): Array<number | "ellipsis"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", pages];
  if (page >= pages - 3) return [1, "ellipsis", pages - 4, pages - 3, pages - 2, pages - 1, pages];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pages];
}

export function Pagination({
  page,
  pages,
  count,
  from,
  to,
  onPage,
}: {
  page: number;
  pages: number;
  count: number;
  from: number;
  to: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span aria-live="polite">
        Showing {count === 0 ? 0 : from}–{to} of {count.toLocaleString()} results
      </span>
      <nav className="flex flex-wrap items-center gap-1" aria-label="Table pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="min-h-11 rounded-xl border border-slate-200 px-3 font-bold transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {pageItems(page, pages).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="grid min-h-11 min-w-8 place-items-center" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPage(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item}`}
              className={`min-h-11 min-w-11 rounded-xl px-3 font-bold transition focus-visible:ring-2 focus-visible:ring-[#0b63f6] ${
                item === page
                  ? "bg-[#02122f] text-white"
                  : "border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="min-h-11 rounded-xl border border-slate-200 px-3 font-bold transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0b63f6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
