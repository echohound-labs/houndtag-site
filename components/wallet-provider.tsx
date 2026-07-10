"use client";

import { useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import "@solana/wallet-adapter-react-ui/styles.css";

// Client-side RPC endpoint. Overridable via NEXT_PUBLIC_X1_RPC_URL; defaults to
// X1 mainnet (mirrors the server-side X1_RPC_URL default in lib/chain.ts).
const ENDPOINT =
  process.env.NEXT_PUBLIC_X1_RPC_URL ?? "https://rpc.mainnet.x1.xyz";

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => ENDPOINT, []);
  const wallets = useMemo(() => [new BackpackWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
