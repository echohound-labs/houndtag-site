import type { Agent, Checkpoint } from "@/lib/chain";
import { truncate, shortHash, isLive } from "@/lib/format";
import { StatusDot } from "./status-dot";

/**
 * DogTag — the site's signature. A physical military dog-tag rendered in
 * brushed steel with the agent's identity *stamped* into it: name debossed
 * across the plate, owner and id in the engraved sub-lines, and the latest
 * memory root pressed into a channel at the base. This is what "verifiable
 * identity" looks like when it's a thing you could hold.
 */
export function DogTag({ agent, latest }: { agent: Agent; latest?: Checkpoint }) {
  const live = isLive(agent.lastCheckpointAt);

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      {/* Bead chain, anchoring the tag. */}
      <div className="mx-auto mb-[-10px] flex justify-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-steel-600 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.6)]" />
        ))}
      </div>

      <div className="brushed relative rounded-[28px] p-[3px] shadow-tag">
        {/* Inner bezel. */}
        <div className="relative rounded-[26px] border border-black/40 bg-transparent p-6">
          {/* Chain hole. */}
          <div
            className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full border border-black/60 bg-steel-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]"
            aria-hidden="true"
          />

          <div className="mt-4">
            <div className="stamp-label text-steel-400">Registered agent · #{agent.id}</div>
            <h3 className="mt-1 font-display text-4xl font-extrabold uppercase leading-none tracking-[0.06em] deboss">
              {agent.name}
            </h3>
          </div>

          {/* Stamped identity lines. */}
          <dl className="mt-5 space-y-2.5 font-mono text-xs">
            <StampRow label="Owner" value={truncate(agent.owner, 6, 6)} />
            <StampRow label="Identity" value={truncate(agent.identityPda, 6, 6)} />
            <div className="flex items-center justify-between border-t border-black/40 pt-2.5">
              <dt className="uppercase tracking-[0.16em] text-steel-500">Status</dt>
              <dd>
                <StatusDot live={live} label />
              </dd>
            </div>
          </dl>

          {/* Latest memory root, pressed into a channel — the tamper-evident bit. */}
          {latest && (
            <div className="engraved mt-5 rounded-md px-3.5 py-3">
              <div className="stamp-label mb-1.5 flex items-center justify-between">
                <span>Latest root · seq {latest.seq}</span>
                <span className="text-phosphor">✓ committed</span>
              </div>
              <code className="block break-all font-mono text-sm text-steel-100">
                {shortHash(latest.hash)}
              </code>
            </div>
          )}

          {/* Notch, like the real tag. */}
          <div
            className="absolute bottom-4 left-1/2 h-2.5 w-8 -translate-x-1/2 rounded-full bg-steel-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]"
            aria-hidden="true"
          />
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}

function StampRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="uppercase tracking-[0.16em] text-steel-500">{label}</dt>
      <dd className="text-steel-200">{value}</dd>
    </div>
  );
}
