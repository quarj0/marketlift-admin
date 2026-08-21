"use client";
import { StatusBadge } from "./status-badge";
import { useAdminData } from "@/components/admin/admin-data-provider";
export function LiveStatusBadge({kind,id,status}:{kind:string;id:string;status:string}){const {getStatus}=useAdminData();return <StatusBadge status={getStatus(kind,id,status)}/>}
