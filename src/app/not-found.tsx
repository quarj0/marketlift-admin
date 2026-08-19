import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f5f7fb] p-6">
      <div className="max-w-md text-center">
        <div className="text-7xl font-black tracking-tight text-[#0b63f6]">404</div>
        <h1 className="mt-4 text-2xl font-black text-slate-950">Admin page not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The route may have moved or the record no longer exists.
        </p>
        <Link
          prefetch={false}
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#02122f] px-4 text-sm font-bold text-white transition hover:bg-[#0b63f6] focus-visible:ring-2 focus-visible:ring-[#0b63f6] focus-visible:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
