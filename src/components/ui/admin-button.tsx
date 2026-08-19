import type { ButtonHTMLAttributes, ReactNode } from "react";

export function AdminButton({ children, variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "outline" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600",
    outline: "bg-white text-slate-700 hover:bg-slate-50 border-slate-300",
    danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border-transparent",
  };
  return <button type={type} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}
