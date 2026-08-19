import type { ButtonHTMLAttributes, ReactNode } from "react";

export function AdminButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "outline" | "danger" | "ghost" | "accent";
}) {
  const styles = {
    primary:
      "border-[#0b63f6] bg-[#0b63f6] text-white hover:border-[#0958dc] hover:bg-[#0958dc]",
    accent:
      "border-[#ff8a00] bg-[#ff8a00] text-[#02122f] hover:border-[#f47f00] hover:bg-[#f47f00]",
    outline:
      "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    danger: "border-red-600 bg-red-600 text-white hover:bg-red-700",
    ghost:
      "border-transparent bg-transparent text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b63f6]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
