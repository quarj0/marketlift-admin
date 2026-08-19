"use client";

import { payments } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminButton } from "@/components/ui/admin-button";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function PaymentsPage() {
  const { toast } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service payments"
        description="Monitor Marketlift selling-plan and promotion payments. Product transactions are not processed by Marketlift in V1."
        actions={
          <AdminButton variant="outline" onClick={() => toast("Payment export prepared", undefined, "info")}>
            <Icons.download size={16} /> Export
          </AdminButton>
        }
      />

      <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 text-sm leading-6 text-orange-950">
        <strong>No escrow or buyer checkout:</strong> this ledger contains Marketlift service fees only—seller-plan subscriptions and listing promotions.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Gross service volume", "R$ 92,7k", "+7.1%"],
          ["Net service revenue", "R$ 84,3k", "+6.1%"],
          ["Success rate", "97.4%", "Healthy"],
          ["Failed today", "6", "Needs review"],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <strong className="mt-2 block text-xl font-black">{value}</strong>
            <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <DataTable
        rows={payments}
        searchText={(payment) => `${payment.id} ${payment.seller} ${payment.type} ${payment.method} ${payment.status}`}
        searchPlaceholder="Search payment, seller or transaction ID…"
        statusOf={(payment) => payment.status}
        statuses={["Paid", "Pending", "Failed", "Cancelled"]}
        selectedLabel="payments"
        columns={[
          {
            key: "payment",
            label: "Payment",
            cell: (payment) => (
              <div>
                <div className="font-bold text-slate-900">{payment.id}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{payment.seller}</div>
              </div>
            ),
          },
          { key: "type", label: "Marketlift service", cell: (payment) => payment.type },
          { key: "amount", label: "Amount", cell: (payment) => <strong className="text-slate-800">{payment.amount}</strong> },
          { key: "method", label: "Method", cell: (payment) => payment.method },
          { key: "date", label: "Date", cell: (payment) => payment.date },
          { key: "status", label: "Status", cell: (payment) => <StatusBadge status={payment.status} /> },
          {
            key: "action",
            label: "",
            cell: (payment) => (
              <button
                type="button"
                onClick={() => toast(`Opened ${payment.id}`, "Transaction detail drawer will connect to Mercado Pago data later.", "info")}
                className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                aria-label={`Open ${payment.id}`}
              >
                <Icons.eye size={16} />
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
