"use client";

import { verifications } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SafeLink } from "@/components/ui/safe-link";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function VerificationsPage() {
  const { getStatus } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity verifications"
        description="Review seller identity checks used as trust signals or required for higher-risk marketplace activity."
      />

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-5 text-blue-950">
        <strong>Verification is optional by default.</strong> Ordinary selling does not require CPF verification. Identity checks may be requested for higher-risk categories or activity, and CPF data remains private.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pending", "18", "Needs a decision"],
          ["Low risk", "11", "Prioritize oldest first"],
          ["Verified today", "26", "+13%"],
          ["Rejected today", "3", "Reason required"],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <strong className="mt-2 block text-xl font-black">{value}</strong>
            <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
          </div>
        ))}
      </div>

      <DataTable
        rows={verifications}
        searchText={(verification) => `${verification.id} ${verification.seller} ${verification.owner} ${verification.document} ${verification.risk}`}
        searchPlaceholder="Search seller, owner or verification ID…"
        statusOf={(verification) => getStatus("verification", verification.id, verification.status)}
        statuses={["Pending", "Verified", "Rejected"]}
        selectedLabel="verification requests"
        columns={[
          {
            key: "seller",
            label: "Selling profile",
            cell: (verification) => (
              <div>
                <div className="font-bold text-slate-900">{verification.seller}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{verification.id}</div>
              </div>
            ),
          },
          { key: "owner", label: "Account holder", cell: (verification) => verification.owner },
          { key: "document", label: "Document", cell: (verification) => verification.document },
          { key: "submitted", label: "Submitted", cell: (verification) => verification.submitted },
          {
            key: "risk",
            label: "Risk",
            cell: (verification) => (
              <span className={`font-bold ${
                verification.risk === "High"
                  ? "text-red-600"
                  : verification.risk === "Medium"
                    ? "text-amber-600"
                    : "text-emerald-600"
              }`}>
                {verification.risk}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            cell: (verification) => <StatusBadge status={getStatus("verification", verification.id, verification.status)} />,
          },
          {
            key: "action",
            label: "",
            cell: (verification) => (
              <SafeLink
                href={`/verifications/${verification.id}`}
                className="grid size-11 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                aria-label={`Review verification ${verification.id}`}
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
