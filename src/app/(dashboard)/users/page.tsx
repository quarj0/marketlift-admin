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
  return <div className="space-y-6">
    <PageHeader title="Users" description="Review buyer and seller accounts and enforce account access controls." actions={<AdminButton variant="outline" onClick={() => toast("Export prepared", "The filtered user export is ready.", "info")}><Icons.download size={16} aria-hidden="true"/> Export</AdminButton>}/>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Total users","24,850","+8.4%"],["Active","23,901","96.2%"],["New this month","1,942","+12.8%"],["Suspended","147","0.6%"]].map(([a,b,c])=><div key={a} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">{a}</p><div className="mt-2 flex items-end justify-between"><strong className="text-xl font-black text-slate-950">{b}</strong><span className="text-[10px] font-bold text-slate-400">{c}</span></div></div>)}</div>
    <DataTable rows={users} searchText={(u)=>`${u.id} ${u.name} ${u.email} ${u.type} ${u.location}`} searchPlaceholder="Search name, email or user ID…" statusOf={(u)=>getStatus("user",u.id,u.status)} statuses={["Active","Pending","Suspended"]} selectedLabel="users" bulkActions={(selected,clear)=><ActionDialog trigger={<button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white">Suspend selected</button>} title="Suspend selected users?" description={`This will suspend ${selected.length} selected account${selected.length===1?"":"s"}.`} confirmLabel="Suspend users" tone="danger" requireReason onConfirm={()=>{selected.forEach(id=>setStatus("user",id,"Suspended"));clear();}}/>} columns={[
      {key:"user",label:"User",cell:(u)=><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-[11px] font-black text-emerald-700">{u.avatar}</span><div><div className="font-bold text-slate-900">{u.name}</div><div className="mt-0.5 text-[10px] text-slate-400">{u.email} · {u.id}</div></div></div>},
      {key:"type",label:"Type",cell:(u)=>u.type},{key:"location",label:"Location",cell:(u)=>u.location},{key:"joined",label:"Joined",cell:(u)=>u.joined},
      {key:"status",label:"Status",cell:(u)=><StatusBadge status={getStatus("user",u.id,u.status)}/>},
      {key:"action",label:"",cell:(u)=><SafeLink className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" href={`/users/${u.id}`} aria-label={`View ${u.name}`}><Icons.chevronRight size={16}/></SafeLink>}
    ]}/>
  </div>;
}
