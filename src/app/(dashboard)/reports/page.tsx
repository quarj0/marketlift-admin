"use client";

import { reports } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SafeLink } from "@/components/ui/safe-link";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function ReportsPage() {
  const { getStatus } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Investigate safety, policy and listing-availability signals submitted by Marketlift users."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open", "31", "Needs triage"],
          ["Availability reports", "7", "Confirm before enforcement"],
          ["High priority", "9", "Safety first"],
          ["Resolved today", "42", "Median 18m"],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <strong className="mt-2 block text-xl font-black">{value}</strong>
            <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-xs leading-5 text-orange-950">
        <strong>Availability reports are signals, not instant takedowns.</strong> Confirm with the seller, look for repeated independent reports or apply the moderation policy before changing a listing status.
      </div>

      <DataTable
        rows={reports}
        searchText={(report) => `${report.id} ${report.target} ${report.type} ${report.reason} ${report.reporter} ${report.priority}`}
        searchPlaceholder="Search target, reporter or report ID…"
        statusOf={(report) => getStatus("report", report.id, report.status)}
        statuses={["Open", "Resolved", "Dismissed"]}
        selectedLabel="reports"
        columns={[
          {
            key: "report",
            label: "Report",
            cell: (report) => (
              <div>
                <div className="max-w-[260px] truncate font-bold text-slate-900">{report.target}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{report.id} · {report.type}</div>
              </div>
            ),
          },
          { key: "reason", label: "Reason", cell: (report) => report.reason },
          { key: "reporter", label: "Reporter", cell: (report) => report.reporter },
          {
            key: "priority",
            label: "Priority",
            cell: (report) => (
              <span className={`font-black ${
                report.priority === "High"
                  ? "text-red-600"
                  : report.priority === "Medium"
                    ? "text-amber-600"
                    : "text-slate-500"
              }`}>
                {report.priority}
              </span>
            ),
          },
          { key: "created", label: "Created", cell: (report) => report.created },
          {
            key: "status",
            label: "Status",
            cell: (report) => <StatusBadge status={getStatus("report", report.id, report.status)} />,
          },
          {
            key: "action",
            label: "",
            cell: (report) => (
              <SafeLink
                href={`/reports/${report.id}`}
                className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                aria-label={`Open report ${report.id}`}
              >
                <Icons.chevronRight size={16} />
              </SafeLink>
            ),
          },
        ]}
      />
    </div>
  );
}
