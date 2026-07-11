import Link from "next/link";
import { getConfig, getAgent, getCheckpoints } from "@/lib/chain";
import { DogTag } from "@/components/dog-tag";
import { StatBar } from "@/components/stat-bar";

// Live on-chain reads at request time — never prerendered against a stale slot.
export const dynamic = "force-dynamic";

type Step = {
  n: string;
  title: string;
  body: string;
  fee: string;
  cmd?: string;
  href?: string;
  cta?: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Register identity",
    body: "Connect a wallet and claim a globally unique, non-transferable name — one transaction in the browser. The owner becomes the only authority that can checkpoint.",
    href: "/register",
    cta: "Register in the browser →",
    fee: "2 XNT · once",
  },
  {
    n: "02",
    title: "Checkpoint memory",
    body: "Point the client at your agent's memory directory. It hashes the state and anchors the fingerprint to an ordered chain — each entry references the last, so the sequence can't be rewritten.",
    cmd: "houndtag checkpoint <agent> --memory ./mem",
    fee: "0.01 XNT · per root",
  },
  {
    n: "03",
    title: "Verify anyone",
    body: "Recompute any agent's checkpoint from its archive and compare it on-chain. A hash that doesn't line up is a memory that was tampered with. No permission, no fee.",
    cmd: "houndtag verify <agent> --seq N",
    fee: "Free · anyone",
  },
];

export default async function HomePage() {
  const [config, echo] = await Promise.all([getConfig(), getAgent("EchoHound")]);
  const checkpoints = echo ? await getCheckpoints(echo.name) : [];
  const latest = checkpoints[0];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="grid items-center gap-12 pb-4 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-24">
        <div>
          <div className="stamp-label mb-6 inline-flex items-center gap-2 rounded-full border border-steel-700 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full live-dot" aria-hidden="true" />
            Agent registry · live on X1
          </div>

          <h1 className="font-display text-[2.6rem] font-extrabold uppercase leading-[0.98] tracking-[0.01em] deboss sm:text-6xl">
            Verifiable identity
            <br />
            and tamper-evident
            <br />
            memory for AI agents
            <span className="block text-steel-400">on X1</span>
          </h1>

          <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-steel-300 sm:text-lg">
            Every agent gets a dog tag: a name it owns on-chain and a memory
            chain nobody can rewrite. Register once, stamp each memory root, and
            let anyone verify the whole history.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="rounded-md border border-phosphor/50 bg-phosphor/10 px-5 py-3 font-mono text-sm uppercase tracking-[0.14em] text-phosphor-glow transition-colors hover:bg-phosphor/20"
            >
              Register an agent
            </Link>
            <Link
              href="/kennel"
              className="rounded-md border border-steel-600 px-5 py-3 font-mono text-sm uppercase tracking-[0.14em] text-steel-200 transition-colors hover:border-steel-500 hover:text-steel-100"
            >
              Browse the kennel
            </Link>
          </div>
        </div>

        {/* The signature: EchoHound's tag. */}
        {echo && (
          <div className="lg:pl-4">
            <DogTag agent={echo} latest={latest} />
          </div>
        )}
      </section>

      {/* ── Live stat bar ────────────────────────────────────────────── */}
      <section className="pt-14 sm:pt-20">
        <div className="stamp-label mb-3 flex items-center gap-2">
          <span className="h-px w-6 bg-steel-600" />
          Program readout
        </div>
        <StatBar config={config} />
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="pt-20 sm:pt-28">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="stamp-label mb-2">The chain of custody</div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-[0.02em] deboss sm:text-4xl">
              Three commands
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-steel-500 sm:block">
            Register, checkpoint, verify. The order is the guarantee.
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="panel flex flex-col rounded-lg p-6">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl font-extrabold leading-none text-steel-700">
                  {step.n}
                </span>
                <span className="stamp-label text-phosphor/70">{step.fee}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-[0.04em] text-steel-100">
                {step.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-300">{step.body}</p>
              {step.cmd ? (
                <div className="engraved mt-5 rounded px-3 py-2.5">
                  <code className="font-mono text-xs text-steel-200">
                    <span className="text-steel-500">$ </span>
                    {step.cmd}
                  </code>
                </div>
              ) : (
                <Link
                  href={step.href!}
                  className="mt-5 inline-block rounded border border-phosphor/40 bg-phosphor/10 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-phosphor-glow transition-colors hover:bg-phosphor/20"
                >
                  {step.cta}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
