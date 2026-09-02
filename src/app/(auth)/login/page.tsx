"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import { apiRequest } from "@/lib/api-client";

type AdminLoginChallengeResponse = {
  authenticated: false;
  verificationRequired: boolean;
  challengeId: string;
  expiresIn: number;
  detail?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const requestCode = async () => {
    const result = await apiRequest<AdminLoginChallengeResponse>(
      "/api/v1/auth/admin-login/",
      {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      },
    );
    setChallengeId(result.challengeId);
    setCode("");
    setNotice("We sent a 6-digit sign-in code if this email has administrator access.");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (!challengeId) {
        await requestCode();
        return;
      }

      await apiRequest("/api/v1/auth/admin-login/verify/", {
        method: "POST",
        body: JSON.stringify({ challengeId, code }),
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError("");
    setNotice("");
    try {
      await requestCode();
      setNotice("A new sign-in code was requested. Check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  const changeEmail = () => {
    setChallengeId(null);
    setCode("");
    setError("");
    setNotice("");
  };

  return (
    <main
      id="admin-main-content"
      className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_.95fr]"
    >
      <section className="relative hidden overflow-hidden bg-[#02122f] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(11,99,246,.28),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,138,0,.22),transparent_28%)]"
          aria-hidden="true"
        />

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
          <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-300">
            Buy · Sell · Grow
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight xl:text-5xl">
            Operate Marketlift with the same product rules users see.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
            Moderate marketplace risk, manage selling capacity, support customers
            and monitor platform operations from one separate admin console.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["One user account", "Selling is a capability, not a second account type."],
              ["Exceptional moderation", "Ordinary listings publish after automated validation."],
              ["Passwordless admin", "Administrator sessions require a short-lived code delivered to an authorized email."],
              ["Audited operations", "Sensitive administrator actions remain attributable and reviewable."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <p className="text-sm font-black">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          Separate administrator access · Sensitive actions are recorded in the audit log
        </p>
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

          {!challengeId ? (
            <>
              <div className="mt-6 lg:mt-0">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#0b63f6]">
                  Administrator access
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Sign in</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your administrator email. We&apos;ll send you a verification code to sign in.
                </p>
              </div>

              <form className="mt-7 space-y-5" onSubmit={submit}>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-700">
                    Email address
                  </span>
                  <div className="relative">
                    <Icons.mail
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@marketlift.com.br"
                      className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-3.5 text-sm outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
                    />
                  </div>
                </label>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b63f6] px-4 text-sm font-black text-white transition hover:bg-[#0958dc] focus-visible:ring-2 focus-visible:ring-[#0b63f6]/35 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {loading ? "Sending code…" : "Continue with Email"}
                  {!loading && <Icons.arrowRight size={17} />}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mt-6 lg:mt-0">
                <div className="grid size-11 place-items-center rounded-full bg-blue-50 text-[#0b63f6]">
                  <Icons.mail size={20} />
                </div>
                <h2 className="mt-5 text-3xl font-black text-slate-950">Check your email</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the 6-digit code sent for
                  <span className="font-bold text-slate-800"> {email.trim()}</span>.
                </p>
                <button
                  type="button"
                  onClick={changeEmail}
                  className="mt-2 text-xs font-bold text-[#0b63f6] hover:underline"
                >
                  Use a different email
                </button>
              </div>

              <form className="mt-7 space-y-5" onSubmit={submit}>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-700">
                    Verification code
                  </span>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    minLength={6}
                    maxLength={6}
                    placeholder="000000"
                    className="h-13 w-full rounded-xl border border-slate-200 px-3.5 text-center text-xl font-black tracking-[.45em] outline-none focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    The code expires in 10 minutes and can only be used once.
                  </p>
                </label>

                {notice && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-700">
                    {notice}
                  </div>
                )}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b63f6] px-4 text-sm font-black text-white transition hover:bg-[#0958dc] focus-visible:ring-2 focus-visible:ring-[#0b63f6]/35 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Verify and sign in"}
                  {!loading && <Icons.arrowRight size={17} />}
                </button>

                <div className="text-center text-xs text-slate-500">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => void resend()}
                    className="font-bold text-[#0b63f6] hover:underline disabled:opacity-50"
                  >
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
            <Icons.lock size={17} className="mt-0.5 shrink-0 text-slate-400" />
            <p>
              Administrator access is restricted. Verification codes are short-lived,
              single-use, and sensitive actions are recorded in the audit log.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
