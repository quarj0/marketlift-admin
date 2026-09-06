import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDataProvider } from "@/components/admin/admin-data-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p role="status" className="p-8">Loading administration…</p>}><AdminDataProvider><AdminShell>{children}</AdminShell></AdminDataProvider></Suspense>;
}
