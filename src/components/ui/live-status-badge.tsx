"use client";
import { StatusBadge } from "./status-badge";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";
export function LiveStatusBadge({kind,id,status}:{kind:string;id:string;status:string}){const {getStatus}=useAdminDemo();return <StatusBadge status={getStatus(kind,id,status)}/>}
