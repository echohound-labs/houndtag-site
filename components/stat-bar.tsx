import type { ChainConfig } from "@/lib/chain";
import { xnt } from "@/lib/format";

/**
 * StatBar — the live instrument panel. Each reading is a stamped gauge: an
 * engraved label over a monospace numeral, divided by milled hairlines. Values
 * come straight from the on-chain config, so this bar tracks the real program.
 */
export function StatBar({ config }: { config: ChainConfig }) {
  const gauges: { label: string; value: string; unit?: string; live?: boolean }[] = [
    { label: "Agents", value: String(config.agentCount), live: true },
    { label: "Checkpoints", value: String(config.totalCheckpoints), live: true },
    { label: "Treasury", value: xnt(config.treasuryBalance), unit: "XNT" },
    { label: "Register fee", value: xnt(config.registrationFee, 0), unit: "XNT" },
    { label: "Checkpoint fee", value: xnt(config.checkpointFee), unit: "XNT" },
  ];

  return (
    <div className="panel overflow-hidden rounded-lg">
      <div className="grid grid-cols-2 divide-x divide-y divide-steel-700/70 sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        {gauges.map((g) => (
          <div key={g.label} className="relative px-5 py-5">
            <div className="stamp-label flex items-center gap-1.5">
              {g.live && <span className="h-1.5 w-1.5 rounded-full live-dot" aria-hidden="true" />}
              {g.label}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-medium tabular-nums text-steel-100">
                {g.value}
              </span>
              {g.unit && (
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-steel-500">
                  {g.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
