import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDataProvider } from "@/components/admin/admin-data-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminDataProvider><AdminShell>{children}</AdminShell></AdminDataProvider>;
}
