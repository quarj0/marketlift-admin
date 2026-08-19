"use client";

import { useMemo, useState } from "react";
import { activityLog } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { AdminButton } from "@/components/ui/admin-button";
import { AdminSelect } from "@/components/ui/select";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function ActivityPage() {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const { toast } = useAdminDemo();

  const rows = useMemo(
    () =>
      activityLog.filter(
        (item) =>
          (!query ||
            `${item.admin} ${item.action} ${item.target}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (actor === "all" || item.admin === actor),
      ),
    [query, actor],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity logs"
        description="Audit administrator, automated moderation and marketplace operations events."
        actions={
          <AdminButton
            variant="outline"
            onClick={() => toast("Audit export prepared", undefined, "info")}
          >
            <Icons.download size={15} /> Export audit log
          </AdminButton>
        }
      />

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0b63f6] shadow-sm">
            <Icons.shield size={18} />
          </span>
          <div>
            <p className="text-xs font-black text-blue-950">Audit-first operations</p>
            <p className="mt-1 text-xs leading-5 text-blue-950/70">
              Production events should be immutable and API-backed. This UI already keeps actor,
              target, time and action context visible for investigation.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search activity log</span>
            <Icons.search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              placeholder="Search action, admin or target…"
            />
          </label>

          <AdminSelect value={actor} onChange={(event) => setActor(event.target.value)} aria-label="Filter activity by actor">
            <option value="all">All actors</option>
            {Array.from(new Set(activityLog.map((item) => item.admin))).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </AdminSelect>
        </div>

        <div className="table-scroll" role="region" aria-label="Activity log" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Actor</th>
                <th scope="col">Action</th>
                <th scope="col">Target</th>
                <th scope="col">IP address</th>
                <th scope="col">Time</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={`${item.time}-${index}`}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                        {item.admin === "System"
                          ? "SY"
                          : item.admin.split(" ").map((part) => part[0]).join("")}
                      </span>
                      <span className="font-bold text-slate-800">{item.admin}</span>
                    </div>
                  </td>
                  <td>{item.action}</td>
                  <td className="font-semibold text-slate-700">{item.target}</td>
                  <td className="font-mono text-[11px]">{item.ip}</td>
                  <td>{item.time}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toast("Audit event inspected", `${item.action} · ${item.target}`, "info")}
                      className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                      aria-label={`Inspect ${item.action} for ${item.target}`}
                    >
                      <Icons.eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="border-t border-slate-100 p-8 text-center text-xs text-slate-500" role="status">
            No audit events match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
