import Link from "next/link";
import { getConfig } from "@/lib/chain";
import { TagMark } from "./tag-mark";

export async function SiteFooter() {
  const config = await getConfig();
  const explorerHref = `${config.explorerBase}/address/${config.programId}`;

  return (
    <footer className="mt-24 border-t rule-milled">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        {/* Program ID, stamped into an engraved plate. */}
        <div className="engraved flex flex-col gap-3 rounded-md px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="stamp-label mb-1">Program ID · {config.network}</div>
            <code className="block truncate font-mono text-sm text-steel-200">
              {config.programId}
            </code>
          </div>
          <a
            href={explorerHref}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 self-start rounded border border-steel-600 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-phosphor transition-colors hover:bg-phosphor/10 sm:self-auto"
          >
            View on Explorer ↗
          </a>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <TagMark size={18} />
            <span className="font-display text-sm font-bold uppercase tracking-stamp text-steel-300">
              Hound·Tag
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-steel-500">
            <Link href="/kennel" className="hover:text-steel-200">Kennel</Link>
            <Link href="/whitepaper" className="hover:text-steel-200">Whitepaper</Link>
            <Link href="/register" className="hover:text-steel-200">Register</Link>
            <a href={explorerHref} target="_blank" rel="noreferrer" className="hover:text-steel-200">
              Explorer
            </a>
          </nav>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-steel-600">
            Built on X1 · {config.network}
          </p>
        </div>
      </div>
    </footer>
  );
}
