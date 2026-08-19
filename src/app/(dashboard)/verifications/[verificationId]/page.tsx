import { SafeLink } from "@/components/ui/safe-link";
import { verifications } from "@/data/mock-data";
import { LiveStatusBadge } from "@/components/ui/live-status-badge";
import { EntityActions } from "@/components/admin/entity-actions";
import { Icons } from "@/lib/icons";

export default async function VerificationDetailPage({ params }: { params: Promise<{ verificationId: string }> }) {
  const { verificationId } = await params;
  const verification = verifications.find((item) => item.id === verificationId) ?? verifications[0];

  return (
    <div className="space-y-6">
      <SafeLink href="/verifications" className="text-xs font-bold text-slate-500 hover:text-[#0b63f6]">
        ← Back to verification queue
      </SafeLink>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black">{verification.seller}</h1>
            <LiveStatusBadge kind="verification" id={verification.id} status={verification.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{verification.id} · Submitted {verification.submitted}</p>
        </div>
        <EntityActions kind="verification" id={verification.id} name={verification.seller} />
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-5 text-blue-950">
        <strong>Private identity data.</strong> Only the minimum information needed for a verification decision should be exposed here. A verified badge confirms an identity check; it does not guarantee a transaction.
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Identity document</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Document front", "Front side of submitted identity document"],
                ["Document back", "Back side of submitted identity document"],
              ].map(([label, aria]) => (
                <div
                  key={label}
                  className="grid aspect-[1.55] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400"
                  role="img"
                  aria-label={aria}
                >
                  <div className="text-center">
                    <Icons.image size={34} className="mx-auto" />
                    <p className="mt-2 text-xs font-bold">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Automated checks</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Document quality", "Passed", "98%"],
                ["Face match", "Passed", "94%"],
                ["Duplicate check", "Passed", "No match"],
              ].map(([label, status, result]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Icons.check size={16} />
                    <span className="text-xs font-black">{status}</span>
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">{result}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-black">Submitted information</h2>
            <div className="mt-4 space-y-4 text-xs">
              <Row label="Legal name" value={verification.owner} />
              <Row label="Selling profile" value={verification.seller} />
              <Row label="Document" value={verification.document} />
              <Row label="CPF" value="***.***.***-42" />
              <Row label="Risk level" value={verification.risk} />
              <Row label="Country" value="Brazil" />
              <Row label="Date of birth" value="14 Mar 1992" />
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[10px] leading-4 text-slate-500">
              Full CPF values should remain restricted and must never appear on the public marketplace.
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
            <label htmlFor="verification-note" className="flex items-center gap-2 text-sm font-black text-amber-900">
              <Icons.alert size={17} /> Decision note
            </label>
            <textarea
              id="verification-note"
              className="mt-3 min-h-24 w-full resize-y rounded-xl border border-amber-200 bg-white p-3 text-xs outline-none transition focus:border-[#0b63f6] focus:ring-2 focus:ring-[#0b63f6]/10"
              placeholder="Add a reason or internal verification note..."
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-800">{value}</strong>
    </div>
  );
}
