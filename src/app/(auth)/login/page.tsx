"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import { apiRequest } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      if (challengeId) {
        await apiRequest("/api/v1/auth/admin-login/verify/", { method: "POST", body: JSON.stringify({ challengeId, code }) });
      } else {
        const result = await apiRequest<{ authenticated:boolean; mfaRequired?:boolean; challengeId?:string }>("/api/v1/auth/admin-login/", { method: "POST", body: JSON.stringify({ email, password }) });
        if (result.mfaRequired && result.challengeId) { setChallengeId(result.challengeId); return; }
      }
      router.replace("/dashboard"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Sign-in failed."); }
    finally { setLoading(false); }
  };

  return (
    <main id="admin-main-content" className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#02122f] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(11,99,246,.28),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,138,0,.22),transparent_28%)]" aria-hidden="true" />

        <div className="relative">
          <Image
            src="/brand/marketlift-logo.png"
            alt="Marketlift"
            width={1105}
            height={195}
            priority
            className="h-auto w-62.5"
          />
          <span className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-slate-300">
            Admin console
          </span>
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-300">Buy · Sell · Grow</p>
          <h1 className="mt-4 text-4xl font-black leading-tight xl:text-5xl">
            Operate Marketlift with the same product rules users see.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
            Moderate marketplace risk, manage selling capacity, review verification signals and monitor Marketlift service payments from one separate admin console.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["One user account", "Selling is a capability, not a second account type."],
              ["Exceptional moderation", "Ordinary listings publish after automated validation."],
              ["Optional verification", "Required only when risk or category policy needs it."],
              ["Service-fee payments", "Seller subscriptions and listing promotions are managed here."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm font-black">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">Separate administrator access · All sensitive actions should be audited</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-[#f5f7fb] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-[#02122f]/5 sm:p-8">
          <div className="lg:hidden">
            <div className="rounded-2xl bg-[#02122f] p-4">
              <Image
                src="/brand/marketlift-logo.png"
                alt="Marketlift"
                width={1105}
                height={195}
                priority
                className="h-auto w-46.25"
              />
            </div>
          </div>

          <div className="mt-6 lg:mt-0">
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#0b63f6]">Administrator access</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use your Marketlift administrator credentials. This console is separate from consumer marketplace accounts.
            </p>
          </div>

          <form className="mt-7 space-y-5" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Admin email</span>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                disabled={Boolean(challengeId)}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Password</span>
              <span className="relative block">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  disabled={Boolean(challengeId)}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-3.5 pr-12 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
                />
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-0 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#0b63f6]"
                >
                  {show ? <Icons.eyeOff size={18} /> : <Icons.eye size={18} />}
                </button>
              </span>
            </label>

            {challengeId && <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Verification code</span>
              <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required minLength={6} maxLength={6} className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm tracking-[.3em] outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10" />
              <p className="mt-2 text-xs text-slate-500">Enter the administrator verification code sent to you.</p>
            </label>}

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b63f6] px-4 text-sm font-black text-white transition hover:bg-[#0958dc] focus-visible:ring-2 focus-visible:ring-[#0b63f6]/35 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {loading ? "Signing in…" : challengeId ? "Verify and sign in" : "Sign in to Marketlift Admin"}
              {!loading && <Icons.arrowRight size={17} />}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
            Administrator access is restricted and sensitive actions are recorded in the audit log.
          </div>
        </div>
      </section>
    </main>
  );
}
