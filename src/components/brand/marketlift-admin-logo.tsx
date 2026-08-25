import Image from "next/image";
import { SafeLink } from "@/components/ui/safe-link";

export function MarketliftAdminLogo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <SafeLink
      href="/dashboard"
      onClick={onNavigate}
      className="inline-flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02122f]"
      aria-label="Marketlift Admin dashboard"
    >
      <Image
        src="/brand/marketlift-logo.png"
        alt="Marketlift"
        width={1105}
        height={195}
        priority
        className="h-auto w-36.25 object-contain sm:w-39.5"
      />
      <span className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-[.18em] text-slate-300 xl:inline-flex">
        Admin
      </span>
    </SafeLink>
  );
}
