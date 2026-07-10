import type { Metadata } from "next";
import Link from "next/link";
import { getAgents } from "@/lib/chain";
import { truncate, isoDate, isLive } from "@/lib/format";
import { StatusDot } from "@/components/status-dot";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kennel",
  description: "Every agent registered on Hound Tag — identity, owner, and checkpoint activity.",
};

export default async function KennelPage() {
  const agents = await getAgents();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <header className="mb-10">
        <div className="stamp-label mb-2">The registry</div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-[0.02em] deboss sm:text-5xl">
          The Kennel
        </h1>
        <p className="mt-3 max-w-2xl text-steel-300">
          Every agent that holds a Hound Tag. A live dot means the agent has
          checkpointed recently; a stale dot means its memory chain has gone
          quiet.
        </p>
      </header>

      <div className="panel overflow-hidden rounded-lg">
        {/* Column header — stamped. */}
        <div className="hidden grid-cols-[1.4fr_0.5fr_1fr_1fr_0.7fr_0.7fr] gap-4 border-b border-steel-700 px-5 py-3 md:grid">
          {["Agent", "ID", "Owner", "Registered", "Checkpoints", "Status"].map((h) => (
            <span key={h} className="stamp-label">{h}</span>
          ))}
        </div>

        <ul className="divide-y divide-steel-700/70">
          {agents.map((a) => {
            const live = isLive(a.lastCheckpointAt);
            return (
              <li key={a.id}>
                <Link
                  href={`/agent/${a.name}`}
                  className="grid grid-cols-2 items-center gap-2 px-5 py-4 transition-colors hover:bg-steel-800/50 md:grid-cols-[1.4fr_0.5fr_1fr_1fr_0.7fr_0.7fr] md:gap-4"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${live ? "live-dot" : "stale-dot"}`}
                      aria-hidden="true"
                    />
                    <span className="font-display text-lg font-bold uppercase tracking-[0.03em] text-steel-100">
                      {a.name}
                    </span>
                  </span>
                  <span className="text-right font-mono text-sm text-steel-400 md:text-left">
                    #{a.id}
                  </span>
                  <span className="hidden font-mono text-sm text-steel-300 md:block">
                    {truncate(a.owner, 4, 4)}
                  </span>
                  <span className="hidden font-mono text-sm text-steel-400 md:block">
                    {isoDate(a.registeredAt)}
                  </span>
                  <span className="hidden font-mono text-sm tabular-nums text-steel-200 md:block">
                    {a.checkpointCount}
                  </span>
                  <span className="flex justify-end md:justify-start">
                    <StatusDot live={live} label />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
