"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

/**
 * WalletMultiButton, styled via the .htag-wallet overrides in globals.css.
 * Rendered client-only (after mount) so the connect state never mismatches
 * between server HTML and the hydrated client.
 */
export function WalletButton({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className="htag-wallet-placeholder"
        aria-hidden="true"
        suppressHydrationWarning
      />
    );
  }
  return <WalletMultiButton className={`htag-wallet ${className}`} />;
}
