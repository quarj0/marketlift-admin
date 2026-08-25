import { Icons } from "@/lib/icons";

export function UpcomingFeature({
  feature,
}: {
  feature: "payments" | "verification";
}) {
  const payment = feature === "payments";
  const Icon = payment ? Icons.money : Icons.verify;

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,.12),transparent_36%),linear-gradient(135deg,#fffbeb,#fff)] p-7 sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-amber-900">
          <Icons.clock size={14} /> Upcoming integration
        </span>
        <span className="mt-6 grid size-14 place-items-center rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-900/15">
          <Icon size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-black text-slate-950">
          {payment ? "Payments and paid seller tools" : "Seller identity verification"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          {payment
            ? "Payment processing, paid subscriptions and listing promotions remain unavailable until the production payment-provider integration is certified."
            : "Identity-document collection remains unavailable until the specialist verification provider and privacy controls are certified."}
        </p>
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
          The backend also blocks creation and processing while this release flag is disabled. Existing implementation remains dormant for later integration.
        </div>
      </div>
    </section>
  );
}
