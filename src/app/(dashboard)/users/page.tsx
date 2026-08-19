"use client";

import { users } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminButton } from "@/components/ui/admin-button";
import { SafeLink } from "@/components/ui/safe-link";
import { ActionDialog } from "@/components/ui/action-dialog";
import { Icons } from "@/lib/icons";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";

export default function UsersPage() {
  const { getStatus, setStatus, toast } = useAdminDemo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage Marketlift accounts. Buying and selling use one account; selling is an optional capability on that account."
        actions={
          <>
            <AdminButton variant="outline" onClick={() => toast("Export prepared", "A CSV export would be downloaded here in the connected product.", "info")}>
              <Icons.download size={16} /> Export
            </AdminButton>
            <AdminButton onClick={() => toast("Create-user flow ready", "The UI is complete; persistence will be connected later.", "info")}>
              + Add user
            </AdminButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total users", "24,850", "+8.4%"],
          ["Active accounts", "23,901", "96.2%"],
          ["Selling enabled", "4,281", "17.2%"],
          ["Suspended", "147", "0.6%"],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <strong className="text-xl font-black text-slate-950">{value}</strong>
              <span className="text-[10px] font-bold text-slate-400">{meta}</span>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        rows={users}
        searchText={(user) => `${user.id} ${user.name} ${user.email} ${user.type} ${user.location}`}
        searchPlaceholder="Search name, email or user ID…"
        statusOf={(user) => getStatus("user", user.id, user.status)}
        statuses={["Active", "Suspended"]}
        selectedLabel="users"
        bulkActions={(selected, clear) => (
          <ActionDialog
            trigger={<button type="button" className="min-h-11 rounded-xl bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500">Suspend selected</button>}
            title="Suspend selected users?"
            description={`This will suspend ${selected.length} selected account${selected.length === 1 ? "" : "s"}.`}
            confirmLabel="Suspend users"
            tone="danger"
            requireReason
            onConfirm={() => {
              selected.forEach((id) => setStatus("user", id, "Suspended"));
              clear();
            }}
          />
        )}
        columns={[
          {
            key: "user",
            label: "User",
            cell: (user) => (
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-50 text-[11px] font-black text-blue-700">{user.avatar}</span>
                <div>
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{user.email} · {user.id}</div>
                </div>
              </div>
            ),
          },
          { key: "selling", label: "Selling capability", cell: (user) => <span className={user.type === "Selling enabled" ? "font-bold text-blue-700" : "text-slate-500"}>{user.type}</span> },
          { key: "location", label: "Location", cell: (user) => user.location },
          { key: "joined", label: "Joined", cell: (user) => user.joined },
          { key: "status", label: "Account status", cell: (user) => <StatusBadge status={getStatus("user", user.id, user.status)} /> },
          {
            key: "action",
            label: "",
            cell: (user) => (
              <SafeLink
                className="inline-flex size-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                href={`/users/${user.id}`}
                aria-label={`View ${user.name}`}
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
