"use client";

export function Pagination({ page, pages, count, from, to, onPage }: { page: number; pages: number; count: number; from: number; to: number; onPage: (page: number) => void }) {
  return <nav className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between" aria-label="Table pagination">
    <span role="status" aria-live="polite">Showing {count === 0 ? 0 : from}–{to} of {count.toLocaleString()} results</span>
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Go to previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
      {Array.from({ length: Math.min(pages, 5) }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} aria-label={`Go to page ${pageNumber}`} aria-current={pageNumber === page ? "page" : undefined} onClick={() => onPage(pageNumber)} className={`min-w-8 rounded-md px-2.5 py-1.5 font-bold ${pageNumber === page ? "bg-slate-900 text-white" : "border border-slate-300 bg-white hover:bg-slate-50"}`}>{pageNumber}</button>)}
      <button type="button" aria-label="Go to next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
    </div>
  </nav>;
}
