/**
 * Display helpers. Presentation only — no data access, no chain knowledge
 * beyond formatting conventions. Safe to use in server and client components.
 */

/** How recent a checkpoint must be for an agent to read as "live". */
export const LIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Truncate a base58 address / hex hash to head…tail for stamped display. */
export function truncate(value: string, head = 4, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** A checkpoint hash shows more head so the leading bytes stay verifiable. */
export function shortHash(hash: string): string {
  return truncate(hash, 8, 6);
}

/** Format XNT amounts with a fixed, stamped-gauge look. */
export function xnt(amount: number, dp = 2): string {
  return `${amount.toFixed(dp)}`;
}

/** True when the last checkpoint falls inside the live window. */
export function isLive(lastCheckpointAt: string, now: number = Date.now()): boolean {
  const t = Date.parse(lastCheckpointAt);
  if (Number.isNaN(t)) return false;
  return now - t <= LIVE_WINDOW_MS;
}

/** Compact absolute date, e.g. "2026-07-10". */
export function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

/** "2026-07-10 · 18:47 UTC" — full stamp for detail views. */
export function stampTime(iso: string): string {
  const d = iso.slice(0, 10);
  const t = iso.slice(11, 16);
  return `${d} · ${t} UTC`;
}

/**
 * Whole-day age of an agent, from registration to `now`. Called only from
 * server components, so wall-clock `now` is safe (no hydration mismatch).
 */
export function ageDays(registeredAt: string, now: number = Date.now()): number {
  const t = Date.parse(registeredAt);
  if (Number.isNaN(t)) return 0;
  const days = Math.floor((now - t) / (24 * 60 * 60 * 1000));
  return Math.max(0, days);
}
