/**
 * lib/chain.ts — the ONE typed data boundary for Hound Tag.
 *
 * Reads the hound_tag program on X1 mainnet over JSON-RPC. Account decoding is
 * ported field-for-field from the proven Python SDK (sdk/python/houndtag/chain.py,
 * `_decode_agent_tag` / `_decode_checkpoint`), which verified against mainnet
 * (checkpoints seq 2 and 3 both matched). Nothing here is guessed — the Borsh
 * layouts come straight from target/idl/hound_tag.json.
 *
 * Server-only: this module uses node:crypto and @solana/web3.js and must never
 * be imported into a client component. Every page that reads it is a Server
 * Component rendered dynamically (see `export const dynamic = "force-dynamic"`).
 *
 * Program: 3zGSABr62ToeG6mC8kKzTpc5Y96AyDyTGHUS2BD3q8ee
 * RPC:     $X1_RPC_URL (defaults to https://rpc.mainnet.x1.xyz)
 */

import { cache } from "react";
import { Connection, PublicKey, type AccountInfo } from "@solana/web3.js";
import bs58 from "bs58";
import { createHash } from "node:crypto";

// ─── Types (the contract — identical to the mock version) ────────────────────

export interface ChainConfig {
  programId: string;
  network: string;
  treasuryBalance: number;
  registrationFee: number;
  checkpointFee: number;
  agentCount: number;
  totalCheckpoints: number;
  explorerBase: string;
}

export interface Agent {
  name: string;
  id: number;
  owner: string;
  metadataUri: string;
  identityPda: string;
  registeredAt: string;
  checkpointCount: number;
  lastCheckpointAt: string;
}

export interface Checkpoint {
  seq: number;
  hash: string;
  memo?: string;
  signature?: string;
  timestamp: string;
}

// ─── Program constants ───────────────────────────────────────────────────────

const PROGRAM_ID = new PublicKey("3zGSABr62ToeG6mC8kKzTpc5Y96AyDyTGHUS2BD3q8ee");
const RPC_URL = process.env.X1_RPC_URL ?? "https://rpc.mainnet.x1.xyz";
const EXPLORER_BASE = process.env.X1_EXPLORER_URL ?? "https://explorer.x1.xyz";
const NETWORK = "X1 Mainnet";
const LAMPORTS_PER_XNT = 1_000_000_000; // native token, 9 decimals like SOL

// Anchor account discriminators (first 8 data bytes), from the IDL.
const AGENT_TAG_DISC = Buffer.from([111, 206, 27, 149, 206, 212, 25, 216]);
const CHECKPOINT_DISC = Buffer.from([199, 62, 186, 186, 98, 119, 211, 139]);
const CONFIG_DISC = Buffer.from([155, 12, 170, 224, 30, 250, 204, 130]);

// Seed prefixes, matching the program's #[account(seeds = ...)] exactly.
const CONFIG_SEED = Buffer.from("config");
const TREASURY_SEED = Buffer.from("treasury");
const AGENT_SEED = Buffer.from("agent");
const CHECKPOINT_SEED = Buffer.from("checkpoint");

let _conn: Connection | null = null;
function conn(): Connection {
  return (_conn ??= new Connection(RPC_URL, "confirmed"));
}

// ─── PDA derivations (mirror chain.py) ───────────────────────────────────────

function configPda(): PublicKey {
  return PublicKey.findProgramAddressSync([CONFIG_SEED], PROGRAM_ID)[0];
}

function treasuryPda(): PublicKey {
  return PublicKey.findProgramAddressSync([TREASURY_SEED], PROGRAM_ID)[0];
}

function agentPda(name: string): PublicKey {
  const nameHash = createHash("sha256").update(name, "utf8").digest();
  return PublicKey.findProgramAddressSync([AGENT_SEED, nameHash], PROGRAM_ID)[0];
}

function checkpointPda(agent: PublicKey, seq: number): PublicKey {
  const seqLe = Buffer.alloc(8);
  seqLe.writeBigUInt64LE(BigInt(seq));
  return PublicKey.findProgramAddressSync(
    [CHECKPOINT_SEED, agent.toBuffer(), seqLe],
    PROGRAM_ID,
  )[0];
}

// ─── Minimal Borsh reader (ported from chain.py `_Reader`) ───────────────────

class Reader {
  private pos: number;
  constructor(private readonly buf: Buffer, offset = 0) {
    this.pos = offset;
  }
  private take(n: number): Buffer {
    const end = this.pos + n;
    if (end > this.buf.length) throw new Error("account data truncated while decoding");
    const chunk = this.buf.subarray(this.pos, end);
    this.pos = end;
    return chunk;
  }
  u8(): number {
    return this.take(1)[0];
  }
  /** u64 as Number — safe for slots/counts/fees in this program's ranges. */
  u64(): number {
    return Number(this.take(8).readBigUInt64LE(0));
  }
  i64(): number {
    return Number(this.take(8).readBigInt64LE(0));
  }
  bytes32Hex(): string {
    return this.take(32).toString("hex");
  }
  pubkey(): string {
    return new PublicKey(this.take(32)).toBase58();
  }
  string(): string {
    const len = this.take(4).readUInt32LE(0);
    return this.take(len).toString("utf8");
  }
  optionPubkey(): string | null {
    const tag = this.u8();
    if (tag === 0) return null;
    if (tag === 1) return this.pubkey();
    throw new Error(`invalid option tag: ${tag}`);
  }
}

// ─── Decoders (byte-for-byte with the Python SDK) ────────────────────────────

interface RawAgentTag {
  pubkey: string;
  agentId: number;
  name: string;
  owner: string;
  createdSlot: number;
  metadataUri: string;
  checkpointCount: number;
  lastMemoryHash: string;
  lastCheckpointSlot: number;
  mint: string | null;
  bump: number;
}

function decodeAgentTag(pubkey: PublicKey, data: Buffer): RawAgentTag {
  if (!data.subarray(0, 8).equals(AGENT_TAG_DISC)) {
    throw new Error("account is not an AgentTag (discriminator mismatch)");
  }
  const r = new Reader(data, 8);
  return {
    pubkey: pubkey.toBase58(),
    agentId: r.u64(),
    name: r.string(),
    owner: r.pubkey(),
    createdSlot: r.u64(),
    metadataUri: r.string(),
    checkpointCount: r.u64(),
    lastMemoryHash: r.bytes32Hex(),
    lastCheckpointSlot: r.u64(),
    mint: r.optionPubkey(),
    bump: r.u8(),
  };
}

interface RawCheckpoint {
  pubkey: string;
  agent: string;
  seq: number;
  memoryHash: string;
  slot: number;
  timestamp: number;
  bump: number;
}

function decodeCheckpoint(pubkey: PublicKey, data: Buffer): RawCheckpoint {
  if (!data.subarray(0, 8).equals(CHECKPOINT_DISC)) {
    throw new Error("account is not a Checkpoint (discriminator mismatch)");
  }
  const r = new Reader(data, 8);
  return {
    pubkey: pubkey.toBase58(),
    agent: r.pubkey(),
    seq: r.u64(),
    memoryHash: r.bytes32Hex(),
    slot: r.u64(),
    timestamp: r.i64(),
    bump: r.u8(),
  };
}

interface RawConfig {
  authority: string;
  registrationFee: number;
  checkpointFee: number;
  agentCount: number;
  bump: number;
  treasuryBump: number;
}

function decodeConfig(data: Buffer): RawConfig {
  if (!data.subarray(0, 8).equals(CONFIG_DISC)) {
    throw new Error("account is not a Config (discriminator mismatch)");
  }
  const r = new Reader(data, 8);
  return {
    authority: r.pubkey(),
    registrationFee: r.u64(),
    checkpointFee: r.u64(),
    agentCount: r.u64(),
    bump: r.u8(),
    treasuryBump: r.u8(),
  };
}

// ─── Slot → time ─────────────────────────────────────────────────────────────
// AgentTag stores only slots; getBlockTime resolves the wall-clock stamp.
// Cached per slot so a directory of N agents doesn't re-query shared slots.

const _blockTimeCache = new Map<number, string>();

async function slotToIso(slot: number): Promise<string> {
  if (!slot) return "";
  const cached = _blockTimeCache.get(slot);
  if (cached !== undefined) return cached;
  let iso = "";
  try {
    const unix = await conn().getBlockTime(slot);
    if (unix != null) iso = new Date(unix * 1000).toISOString();
  } catch {
    // Leave empty; callers (isLive/formatters) tolerate a missing stamp.
  }
  _blockTimeCache.set(slot, iso);
  return iso;
}

async function toAgent(raw: RawAgentTag): Promise<Agent> {
  const [registeredAt, lastCheckpointAt] = await Promise.all([
    slotToIso(raw.createdSlot),
    raw.checkpointCount > 0 ? slotToIso(raw.lastCheckpointSlot) : Promise.resolve(""),
  ]);
  return {
    name: raw.name,
    id: raw.agentId,
    owner: raw.owner,
    metadataUri: raw.metadataUri,
    identityPda: raw.pubkey,
    registeredAt,
    checkpointCount: raw.checkpointCount,
    lastCheckpointAt,
  };
}

async function fetchAllAgentTags(): Promise<RawAgentTag[]> {
  const accounts = await conn().getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(AGENT_TAG_DISC) } }],
  });
  return accounts.map(({ pubkey, account }) =>
    decodeAgentTag(pubkey, account.data as Buffer),
  );
}

// ─── Public interface (unchanged signatures) ─────────────────────────────────
// Wrapped in React cache() so multiple components in one request (e.g. the
// footer and the page both reading getConfig) share a single RPC round-trip.

export const getConfig = cache(async (): Promise<ChainConfig> => {
  const [cfgInfo, treasuryLamports, agentTags] = await Promise.all([
    conn().getAccountInfo(configPda()),
    conn().getBalance(treasuryPda()),
    fetchAllAgentTags(),
  ]);
  if (!cfgInfo) throw new Error("Hound Tag config account not found on X1");

  const cfg = decodeConfig(cfgInfo.data as Buffer);
  const totalCheckpoints = agentTags.reduce((n, a) => n + a.checkpointCount, 0);

  return {
    programId: PROGRAM_ID.toBase58(),
    network: NETWORK,
    treasuryBalance: treasuryLamports / LAMPORTS_PER_XNT,
    registrationFee: cfg.registrationFee / LAMPORTS_PER_XNT,
    checkpointFee: cfg.checkpointFee / LAMPORTS_PER_XNT,
    agentCount: cfg.agentCount,
    totalCheckpoints,
    explorerBase: EXPLORER_BASE,
  };
});

export const getAgents = cache(async (): Promise<Agent[]> => {
  const raws = await fetchAllAgentTags();
  const agents = await Promise.all(raws.map(toAgent));
  // Registry order: by registration number.
  return agents.sort((a, b) => a.id - b.id);
});

export const getAgent = cache(async (name: string): Promise<Agent | null> => {
  const pda = agentPda(name);
  const info = await conn().getAccountInfo(pda);
  if (!info) return null;
  return toAgent(decodeAgentTag(pda, info.data as Buffer));
});

export const getCheckpoints = cache(async (name: string): Promise<Checkpoint[]> => {
  const agent = agentPda(name);
  const info = await conn().getAccountInfo(agent);
  if (!info) return [];
  const tag = decodeAgentTag(agent, info.data as Buffer);
  if (tag.checkpointCount === 0) return [];

  // Checkpoints are PDAs at seq 1..count — derive and batch-fetch, no scan.
  const seqs = Array.from({ length: tag.checkpointCount }, (_, i) => i + 1);
  const pdas = seqs.map((seq) => checkpointPda(agent, seq));
  const infos = await getMultipleAccounts(pdas);

  const decoded = infos
    .map((acc, i) => (acc ? decodeCheckpoint(pdas[i], acc.data as Buffer) : null))
    .filter((c): c is RawCheckpoint => c !== null);

  // Best-effort: attach the tx signature that landed each checkpoint (for the
  // explorer link). The account is write-once, so the single signature is it.
  const checkpoints = await Promise.all(
    decoded.map(async (cp, i): Promise<Checkpoint> => {
      let signature: string | undefined;
      try {
        const sigs = await conn().getSignaturesForAddress(pdas[i], { limit: 1 });
        signature = sigs[0]?.signature;
      } catch {
        // Explorer link is optional; omit on failure.
      }
      return {
        seq: cp.seq,
        hash: cp.memoryHash,
        signature,
        timestamp: cp.timestamp ? new Date(cp.timestamp * 1000).toISOString() : "",
      };
    }),
  );

  // Newest first — the natural read order for a reputation timeline.
  return checkpoints.sort((a, b) => b.seq - a.seq);
});

/** getMultipleAccountsInfo in chunks of 100 (RPC batch limit). */
async function getMultipleAccounts(
  pdas: PublicKey[],
): Promise<(AccountInfo<Buffer> | null)[]> {
  const out: (AccountInfo<Buffer> | null)[] = [];
  for (let i = 0; i < pdas.length; i += 100) {
    const chunk = pdas.slice(i, i + 100);
    out.push(...(await conn().getMultipleAccountsInfo(chunk)));
  }
  return out;
}
