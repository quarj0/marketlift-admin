"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ToastTone = "success" | "danger" | "info";
type Toast = { id: number; title: string; description?: string; tone: ToastTone };
type Overrides = Record<string, string>;

type ContextValue = {
  getStatus: (kind: string, id: string, fallback: string) => string;
  setStatus: (kind: string, id: string, status: string, message?: string) => void;
  toast: (title: string, description?: string, tone?: ToastTone) => void;
};

const AdminDemoContext = createContext<ContextValue | null>(null);
const STORAGE_KEY = "marketlift-admin-ui-state-v2";

export function AdminDemoProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const storageReady = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) queueMicrotask(() => { setOverrides(JSON.parse(raw) as Overrides); storageReady.current = true; });
      else storageReady.current = true;
    } catch {
      // Local demo state is optional. The UI still works without storage.
    }
  }, []);

  useEffect(() => {
    if (!storageReady.current) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); } catch {}
  }, [overrides]);

  const toast = useCallback((title: string, description?: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3600);
  }, []);

  const setStatus = useCallback((kind: string, id: string, status: string, message?: string) => {
    setOverrides((current) => ({ ...current, [`${kind}:${id}`]: status }));
    toast(message ?? `${id} updated`, `Status changed to ${status}.`);
  }, [toast]);

  const value = useMemo<ContextValue>(() => ({
    getStatus: (kind, id, fallback) => overrides[`${kind}:${id}`] ?? fallback,
    setStatus,
    toast,
  }), [overrides, setStatus, toast]);

  return <AdminDemoContext.Provider value={value}>
    {children}
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map((item) => <div key={item.id} className={`pointer-events-auto rounded-xl border bg-white p-4 shadow-2xl shadow-slate-950/10 ${item.tone === "danger" ? "border-red-200" : item.tone === "info" ? "border-blue-200" : "border-emerald-200"}`}>
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-black ${item.tone === "danger" ? "bg-red-50 text-red-700" : item.tone === "info" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>{item.tone === "danger" ? "!" : item.tone === "info" ? "i" : "✓"}</span>
          <div><p className="text-sm font-black text-slate-900">{item.title}</p>{item.description && <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>}</div>
        </div>
      </div>)}
    </div>
  </AdminDemoContext.Provider>;
}

export function useAdminDemo() {
  const value = useContext(AdminDemoContext);
  if (!value) throw new Error("useAdminDemo must be used within AdminDemoProvider");
  return value;
}
