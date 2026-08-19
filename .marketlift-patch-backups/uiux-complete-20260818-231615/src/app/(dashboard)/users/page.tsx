import Link from "next/link";
import { users } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { TableTools } from "@/components/ui/table-tools";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminButton } from "@/components/ui/admin-button";
import { Icons } from "@/lib/icons";

export default function UsersPage() {
  return <div className="space-y-6">
    <PageHeader title="Users" description="Manage buyer and seller accounts across Marketlift." actions={<><AdminButton variant="outline"><Icons.download size={16}/> Export</AdminButton><AdminButton>+ Add user</AdminButton></>}/>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Total users","24,850","+8.4%"],["Active","23,901","96.2%"],["New this month","1,942","+12.8%"],["Suspended","147","0.6%"]].map(([a,b,c])=><div key={a} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">{a}</p><div className="mt-2 flex items-end justify-between"><strong className="text-xl font-black text-slate-950">{b}</strong><span className="text-[10px] font-bold text-slate-400">{c}</span></div></div>)}</div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <TableTools placeholder="Search name, email or user ID..."><button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600"><Icons.filter size={15}/> Status</button><button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600">User type <Icons.arrowDown size={12}/></button></TableTools>
      <div className="table-scroll"><table className="admin-table"><thead><tr><th>User</th><th>Type</th><th>Location</th><th>Joined</th><th>Status</th><th/></tr></thead><tbody>{users.map(user=><tr key={user.id}><td><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-[11px] font-black text-emerald-700">{user.avatar}</span><div><div className="font-bold text-slate-900">{user.name}</div><div className="mt-0.5 text-[10px] text-slate-400">{user.email} · {user.id}</div></div></div></td><td>{user.type}</td><td>{user.location}</td><td>{user.joined}</td><td><StatusBadge status={user.status}/></td><td><Link className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" href={`/users/${user.id}`}><Icons.chevronRight size={16}/></Link></td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500"><span>Showing 1–6 of 24,850 users</span><div className="flex gap-1"><button className="rounded-md border border-slate-200 px-2.5 py-1.5">Previous</button><button className="rounded-md bg-slate-900 px-2.5 py-1.5 font-bold text-white">1</button><button className="rounded-md border border-slate-200 px-2.5 py-1.5">2</button><button className="rounded-md border border-slate-200 px-2.5 py-1.5">Next</button></div></div>
    </div>
  </div>;
}
