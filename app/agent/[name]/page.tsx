import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgent, getCheckpoints, getConfig } from "@/lib/chain";
import { truncate, shortHash, isLive, isoDate, stampTime, ageDays } from "@/lib/format";
import { StatusDot } from "@/components/status-dot";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { name: string };
}): Promise<Metadata> {
  const agent = await getAgent(params.name);
  if (!agent) return { title: "Agent not found" };
  return {
    title: `${agent.name} · reputation`,
    description: `${agent.name} (#${agent.id}) — ${agent.checkpointCount} verified memory checkpoints on X1.`,
  };
}

export default async function AgentPage({ params }: { params: { name: string } }) {
  const agent = await getAgent(params.name);
  if (!agent) notFound();

  const [checkpoints, config] = await Promise.all([
    getCheckpoints(agent.name),
    getConfig(),
  ]);
  const live = isLive(agent.lastCheckpointAt);
  const age = ageDays(agent.registeredAt);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <Link
        href="/kennel"
        className="stamp-label inline-block transition-colors hover:text-steel-300"
      >
        ← Kennel
      </Link>

      {/* Identity header. */}
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="stamp-label mb-1">Registered agent · #{agent.id}</div>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-none tracking-[0.03em] deboss sm:text-6xl">
            {agent.name}
          </h1>
        </div>
        <StatusDot live={live} label className="mb-2" />
      </header>

      {/* Metadata + streak cards. */}
      <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel rounded-lg p-6">
          <div className="stamp-label mb-4">Metadata</div>
          <dl className="space-y-3.5 text-sm">
            <MetaRow label="Owner" value={truncate(agent.owner, 8, 8)} mono />
            <MetaRow label="Identity PDA" value={truncate(agent.identityPda, 8, 8)} mono />
            <MetaRow label="Registered" value={stampTime(agent.registeredAt)} mono />
            <MetaRow label="Metadata URI">
              <a
                href={agent.metadataUri}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm text-phosphor hover:underline"
              >
                {agent.metadataUri.replace("https://", "")} ↗
              </a>
            </MetaRow>
            <MetaRow label="Program">
              <a
                href={`${config.explorerBase}/address/${config.programId}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm text-phosphor hover:underline"
              >
                {truncate(config.programId, 8, 8)} ↗
              </a>
            </MetaRow>
          </dl>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <StatPlate label="Checkpoints" value={String(agent.checkpointCount)} />
          <StatPlate label="Latest seq" value={`#${checkpoints[0]?.seq ?? 0}`} />
          <StatPlate label="Age" value={String(age)} unit={age === 1 ? "day" : "days"} />
          <StatPlate label="Last root" value={isoDate(agent.lastCheckpointAt)} small />
        </section>
      </div>

      {/* Checkpoint timeline — the reputation surface. */}
      <section className="mt-12">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.03em] text-steel-100">
            Memory chain
          </h2>
          <span className="stamp-label">{checkpoints.length} roots · newest first</span>
        </div>

        <ol className="relative border-l border-steel-700 pl-6">
          {checkpoints.map((cp, i) => (
            <li key={cp.seq} className="relative pb-8 last:pb-0">
              {/* Node on the chain. */}
              <span
                className={`absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full ring-4 ring-steel-950 ${
                  i === 0 ? "live-dot" : "bg-steel-600"
                }`}
                aria-hidden="true"
              />
              <div className="engraved rounded-md p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-steel-100">
                      seq {cp.seq}
                    </span>
                    {i === 0 && (
                      <span className="stamp-label text-phosphor">✓ latest root</span>
                    )}
                    {cp.memo && (
                      <span className="font-mono text-xs text-steel-500">· {cp.memo}</span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-steel-500">
                    {stampTime(cp.timestamp)}
                  </span>
                </div>
                <code className="mt-3 block break-all font-mono text-sm text-steel-200">
                  {cp.hash}
                </code>
                {cp.signature && (
                  <a
                    href={`${config.explorerBase}/tx/${cp.signature}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-mono text-xs text-steel-500 hover:text-phosphor"
                  >
                    tx {shortHash(cp.signature)} ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-steel-700/60 pb-3 last:border-0 last:pb-0">
      <dt className="stamp-label">{label}</dt>
      <dd className={mono ? "font-mono text-sm text-steel-200" : "text-steel-200"}>
        {children ?? value}
      </dd>
    </div>
  );
}

function StatPlate({
  label,
  value,
  unit,
  small,
}: {
  label: string;
  value: string;
  unit?: string;
  small?: boolean;
}) {
  return (
    <div className="engraved flex flex-col justify-center rounded-lg px-4 py-5">
      <div className="stamp-label mb-1.5">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-mono font-medium tabular-nums text-steel-100 ${
            small ? "text-lg" : "text-3xl"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-steel-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
