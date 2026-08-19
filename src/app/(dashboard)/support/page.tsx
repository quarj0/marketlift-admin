"use client";

import { supportTickets } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionDialog } from "@/components/ui/action-dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function SupportPage() {
  const { getStatus, setStatus, toast } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Triage account, selling-tool and Marketlift service-payment issues while keeping response times healthy."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open tickets", "12", "4 high priority"],
          ["First response", "8m", "Target < 15m"],
          ["Resolution time", "2h 14m", "-18%"],
          ["CSAT", "4.7/5", "92% positive"],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <strong className="mt-2 block text-xl font-black">{value}</strong>
            <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <DataTable
        rows={supportTickets}
        searchText={(ticket) => `${ticket.id} ${ticket.user} ${ticket.subject} ${ticket.category} ${ticket.priority}`}
        searchPlaceholder="Search ticket, user or subject…"
        statusOf={(ticket) => getStatus("ticket", ticket.id, ticket.status)}
        statuses={["Open", "Pending", "Resolved"]}
        selectedLabel="tickets"
        columns={[
          {
            key: "ticket",
            label: "Ticket",
            cell: (ticket) => (
              <div>
                <div className="max-w-[300px] truncate font-bold text-slate-900">{ticket.subject}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{ticket.id} · {ticket.user}</div>
              </div>
            ),
          },
          { key: "category", label: "Category", cell: (ticket) => ticket.category },
          {
            key: "priority",
            label: "Priority",
            cell: (ticket) => (
              <span className={`font-black ${ticket.priority === "High" ? "text-red-600" : "text-slate-600"}`}>
                {ticket.priority}
              </span>
            ),
          },
          { key: "updated", label: "Updated", cell: (ticket) => ticket.updated },
          {
            key: "status",
            label: "Status",
            cell: (ticket) => <StatusBadge status={getStatus("ticket", ticket.id, ticket.status)} />,
          },
          {
            key: "action",
            label: "",
            cell: (ticket) => (
              <ActionDialog
                trigger={
                  <button
                    type="button"
                    className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                    aria-label={`Reply to ticket ${ticket.id}`}
                  >
                    <Icons.chevronRight size={16} />
                  </button>
                }
                title={ticket.subject}
                description={`${ticket.id} · ${ticket.user} · ${ticket.category}`}
                confirmLabel="Send reply"
                onConfirm={() => {
                  setStatus("ticket", ticket.id, "Pending");
                  toast("Reply staged", `Ticket ${ticket.id} is waiting for the user.`);
                }}
                requireReason
              />
            ),
          },
        ]}
      />
    </div>
  );
}
