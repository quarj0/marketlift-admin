"use client";
import { createContext, useContext } from "react";
export type TableQuery = { query: string; status: string; page: number; pageSize: number };
export const initialTableQuery: TableQuery = { query: "", status: "all", page: 1, pageSize: 25 };
export const TableQueryContext = createContext<null | (TableQuery & { total: number; loading: boolean; update: (patch: Partial<TableQuery>) => void })>(null);
export const useTableQuery = () => useContext(TableQueryContext);
