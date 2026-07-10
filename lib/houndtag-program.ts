/**
 * lib/houndtag-program.ts — Anchor client for the hound_tag program.
 *
 * Used by the browser wallet flow (client components). Server reads still go
 * through lib/chain.ts; this module is for building and sending transactions
 * with a connected wallet.
 *
 * PDA seeds mirror the on-chain program EXACTLY (programs/hound-tag/src/lib.rs):
 *   config    = ["config"]
 *   treasury  = ["treasury"]
 *   agent     = ["agent", sha256(utf8 name)]   ← 32 raw hash bytes, not the string
 *   checkpoint= ["checkpoint", agentTag, seq u64 LE]
 */

import { Buffer } from "buffer"; // browser bundle has no global Buffer
import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { sha256 } from "js-sha256";
import idl from "./hound_tag.json";
import type { HoundTag } from "./hound_tag-types";

export const HOUNDTAG_PROGRAM_ID = new PublicKey(
  "3zGSABr62ToeG6mC8kKzTpc5Y96AyDyTGHUS2BD3q8ee",
);

/**
 * Build a typed Anchor Program bound to the connected wallet. Anchor 0.30+
 * reads the program address from `idl.address`, so no programId argument.
 */
export function getProgram(
  connection: Connection,
  wallet: AnchorWallet,
): Program<HoundTag> {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl as Idl, provider) as unknown as Program<HoundTag>;
}

// ─── PDA helpers ─────────────────────────────────────────────────────────────

export function configPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    HOUNDTAG_PROGRAM_ID,
  )[0];
}

export function treasuryPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    HOUNDTAG_PROGRAM_ID,
  )[0];
}

/** sha256 over the utf8 name bytes, as 32 raw bytes (js-sha256). */
export function nameHash(name: string): Buffer {
  return Buffer.from(sha256.arrayBuffer(name));
}

export function agentPda(name: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent"), nameHash(name)],
    HOUNDTAG_PROGRAM_ID,
  )[0];
}

export function checkpointPda(agentTag: PublicKey, seq: number): PublicKey {
  const seqLe = Buffer.alloc(8);
  seqLe.writeBigUInt64LE(BigInt(seq));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("checkpoint"), agentTag.toBuffer(), seqLe],
    HOUNDTAG_PROGRAM_ID,
  )[0];
}
