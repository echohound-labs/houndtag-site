import type { Metadata } from "next";
import { getConfig } from "@/lib/chain";
import { xnt } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register",
  description: "Install the Hound Tag SDK and register an agent in three commands. Fees and PDA spec.",
};

const COMMANDS = [
  {
    step: "Register",
    body: "Claim a name and mint the identity PDA. Signed by your keypair; the owner becomes the only authority that can checkpoint.",
    cmd: "houndtag register EchoHound \\\n  --keypair ~/.config/x1/id.json",
  },
  {
    step: "Checkpoint",
    body: "Hash your agent's memory state (SHA-256) and append the root. Pass the digest; the SDK derives the next seq and sends the transaction.",
    cmd: "houndtag checkpoint EchoHound \\\n  --root 7214...acd2",
  },
  {
    step: "Verify",
    body: "Read the full chain for any agent and recompute each root. Exits non-zero if a link is broken. No keypair, no fee.",
    cmd: "houndtag verify EchoHound",
  },
];

const PDAS = [
  {
    name: "Config",
    seeds: '[b"config"]',
    note: "Singleton. Holds fees, treasury, and the global agent counter.",
  },
  {
    name: "Identity",
    seeds: '[b"agent", name.as_bytes()]',
    note: "One per agent. Stores owner, id, metadata_uri, and checkpoint_count.",
  },
  {
    name: "Checkpoint",
    seeds: '[b"checkpoint", identity.key(), &seq.to_le_bytes()]',
    note: "One per memory root. Stores seq, hash, and the previous root.",
  },
];

export default async function RegisterPage() {
  const config = await getConfig();

  const fees = [
    { label: "Register", amount: `${xnt(config.registrationFee, 0)} XNT`, when: "once, at claim" },
    { label: "Checkpoint", amount: `${xnt(config.checkpointFee)} XNT`, when: "per memory root" },
    { label: "Verify", amount: "Free", when: "read-only, anyone" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
      <header className="mb-12">
        <div className="stamp-label mb-2">SDK quickstart</div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-[0.02em] deboss sm:text-5xl">
          Tag your agent
        </h1>
        <p className="mt-3 max-w-2xl text-steel-300">
          The Python SDK talks to the Hound Tag program on {config.network}. Install
          it, point it at an X1 keypair, and you have a registered agent in three
          commands.
        </p>
      </header>

      {/* Install. */}
      <section className="mb-14">
        <div className="stamp-label mb-3">1 · Install</div>
        <div className="engraved rounded-lg px-5 py-4">
          <code className="font-mono text-sm text-steel-100">
            <span className="text-steel-500">$ </span>pip install houndtag
          </code>
        </div>
      </section>

      {/* Three commands. */}
      <section className="mb-14">
        <div className="stamp-label mb-4">2 · Three commands</div>
        <div className="space-y-4">
          {COMMANDS.map((c, i) => (
            <div key={c.step} className="panel rounded-lg p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl font-extrabold text-steel-700">
                  0{i + 1}
                </span>
                <h3 className="font-display text-xl font-bold uppercase tracking-[0.04em] text-steel-100">
                  {c.step}
                </h3>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-300">{c.body}</p>
              <div className="engraved mt-4 rounded px-4 py-3">
                <pre className="overflow-x-auto font-mono text-sm text-steel-200">
                  <span className="text-steel-500">$ </span>
                  {c.cmd}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fees. */}
      <section className="mb-14">
        <div className="stamp-label mb-4">Fees</div>
        <div className="panel overflow-hidden rounded-lg">
          <div className="divide-y divide-steel-700/70">
            {fees.map((f) => (
              <div key={f.label} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4">
                <div>
                  <div className="font-display text-lg font-bold uppercase tracking-[0.03em] text-steel-100">
                    {f.label}
                  </div>
                  <div className="stamp-label mt-0.5">{f.when}</div>
                </div>
                <div className="font-mono text-lg tabular-nums text-phosphor-glow">{f.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDA spec. */}
      <section>
        <div className="stamp-label mb-4">PDA spec</div>
        <div className="space-y-3">
          {PDAS.map((p) => (
            <div key={p.name} className="panel rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold uppercase tracking-[0.04em] text-steel-100">
                  {p.name} PDA
                </h3>
                <code className="engraved rounded px-3 py-1.5 font-mono text-xs text-phosphor">
                  {p.seeds}
                </code>
              </div>
              <p className="mt-2 text-sm text-steel-400">{p.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-steel-500">
          Program ID · {config.programId}
        </p>
      </section>
    </div>
  );
}
