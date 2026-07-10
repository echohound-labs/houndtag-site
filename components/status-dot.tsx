/**
 * StatusDot — the single place "live" vs "stale" is rendered. Live agents have
 * checkpointed inside the live window and glow phosphor-green; stale agents show
 * a dim amber dot. Optionally labeled.
 */
export function StatusDot({
  live,
  label = false,
  className = "",
}: {
  live: boolean;
  label?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`h-2 w-2 rounded-full ${live ? "live-dot" : "stale-dot"}`}
        aria-hidden="true"
      />
      {label && (
        <span
          className={`font-mono text-[0.6875rem] uppercase tracking-[0.18em] ${
            live ? "text-phosphor-glow" : "text-rust"
          }`}
        >
          {live ? "Live" : "Stale"}
        </span>
      )}
    </span>
  );
}
