import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDemoProvider } from "@/components/admin/admin-demo-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminDemoProvider><AdminShell>{children}</AdminShell></AdminDemoProvider>;
}
