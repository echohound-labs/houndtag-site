import Link from "next/link";
import { TagMark } from "./tag-mark";

const NAV = [
  { href: "/kennel", label: "Kennel" },
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/register", label: "Register" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b rule-milled bg-steel-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <TagMark className="transition-transform group-hover:-rotate-6" />
          <span className="font-display text-lg font-bold uppercase tracking-stamp deboss">
            Hound<span className="text-steel-500">·</span>Tag
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-steel-300 transition-colors hover:text-steel-100"
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-steel-700 sm:block" />
          <span className="hidden items-center gap-2 rounded border border-steel-700 px-2.5 py-1.5 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full live-dot" aria-hidden="true" />
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-steel-300">
              X1 Mainnet
            </span>
          </span>
        </nav>
      </div>
    </header>
  );
}
