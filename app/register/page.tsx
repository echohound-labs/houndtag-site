import type { Metadata } from "next";
import { getConfig } from "@/lib/chain";
import { xnt } from "@/lib/format";
import { RegisterAgentPanel } from "@/components/register-agent-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register your agent in the browser, then connect it from the terminal with the open-source houndtag Python client. Fees and PDA spec.",
};

const GITHUB_URL = "https://github.com/echohound-labs/houndtag";

type Walk = { step: string; body: string; cmd: string; fee?: string; raw?: boolean };

const WALKTHROUGH: Walk[] = [
  {
    step: "Install",
    body: "The client is on PyPI — open source, MIT. It wraps the same on-chain program this page reads.",
    cmd: "pip install houndtag",
  },
  {
    step: "Preview",
    body: "Point it at your agent's memory directory. It hashes the current state locally and prints the root hash and next sequence — nothing is sent.",
    cmd: "houndtag checkpoint <YourAgent> --memory ./your-memory-dir --dry-run",
  },
  {
    step: "Anchor",
    body: "Commit the fingerprint on-chain, signed by the wallet that owns the tag. Runs where your agent runs — the memory itself never leaves your machine, only its hash.",
    cmd: "houndtag checkpoint <YourAgent> --memory ./your-memory-dir \\\n  --keypair ~/.config/solana/id.json",
    fee: "0.01 XNT",
  },
  {
    step: "Schedule",
    body: "Drop it in cron (nightly, hourly — your call) so your agent keeps checkpointing on its own and stays LIVE in the Kennel instead of going stale.",
    cmd: "# crontab -e — checkpoint nightly at 03:00\n0 3 * * *  houndtag checkpoint <YourAgent> --memory ./your-memory-dir --keypair ~/.config/solana/id.json --skip-unchanged",
    raw: true,
  },
  {
    step: "Verify anyone",
    body: "Anyone can recompute an agent's checkpoint and compare it on-chain. Permissionless, no keypair, no fee.",
    cmd: "houndtag verify <name> --seq N",
    fee: "Free",
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
      <header className="mb-8">
        <div className="stamp-label mb-2">Register</div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-[0.02em] deboss sm:text-5xl">
          Tag your agent
        </h1>
        <p className="mt-3 max-w-2xl text-steel-300">
          Claim a globally unique, non-transferable identity on {config.network}.
          Connect a wallet below and register in the browser — then connect your
          agent from the terminal with the open-source{" "}
          <span className="font-mono text-steel-200">houndtag</span> client.
        </p>
      </header>

      {/* Live wallet registration — the primary path. */}
      <RegisterAgentPanel registrationFee={config.registrationFee} />

      {/* Connect your agent — the live CLI walkthrough. */}
      <div
        id="connect"
        className="mb-10 mt-16 scroll-mt-24 border-t border-steel-700 pt-12"
      >
        <div className="stamp-label mb-2">Step two · from the terminal</div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-[0.03em] deboss sm:text-3xl">
          Connect your agent
        </h2>
        <p className="mt-3 max-w-2xl text-steel-400">
          Registration lives in the browser (above). Everything after — anchoring
          your agent&rsquo;s memory — runs from wherever your agent runs, with the
          open-source <span className="font-mono text-steel-200">houndtag</span>{" "}
          client. The memory never leaves your machine; only its fingerprint goes
          on-chain.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-steel-600 px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-steel-300 transition-colors hover:text-steel-100"
        >
          <span className="h-1.5 w-1.5 rounded-full live-dot" aria-hidden="true" />
          Open source · MIT · GitHub ↗
        </a>
      </div>

      <section className="mb-14 space-y-4">
        {WALKTHROUGH.map((c, i) => (
          <div key={c.step} className="panel rounded-lg p-6">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl font-extrabold text-steel-700">
                  0{i + 1}
                </span>
                <h3 className="font-display text-xl font-bold uppercase tracking-[0.04em] text-steel-100">
                  {c.step}
                </h3>
              </div>
              {c.fee && (
                <span className="stamp-label text-phosphor/70">{c.fee}</span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-300">{c.body}</p>
            <div className="engraved mt-4 rounded px-4 py-3">
              <pre className="overflow-x-auto font-mono text-sm text-steel-200">
                {!c.raw && <span className="text-steel-500">$ </span>}
                {c.cmd}
              </pre>
            </div>
          </div>
        ))}
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
