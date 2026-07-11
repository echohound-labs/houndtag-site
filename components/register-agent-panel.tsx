"use client";

import { useEffect, useRef, useState } from "react";
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import {
  getProgram,
  configPda,
  treasuryPda,
  agentPda,
} from "@/lib/houndtag-program";
import { WalletButton } from "./wallet-button";

const EXPLORER_TX = "https://explorer.x1.xyz/tx/";
const NAME_RE = /^[A-Za-z0-9_-]{1,32}$/;

type Availability =
  | { kind: "idle" }
  | { kind: "invalid" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "taken" }
  | { kind: "error" };

type Submit =
  | { kind: "idle" }
  | { kind: "simulating" }
  | { kind: "signing" }
  | { kind: "confirming" }
  | { kind: "done"; sig: string; name: string }
  | { kind: "error"; message: string; logs?: string[] };

export function RegisterAgentPanel({ registrationFee }: { registrationFee: number }) {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const anchorWallet = useAnchorWallet();

  const [name, setName] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [avail, setAvail] = useState<Availability>({ kind: "idle" });
  const [submit, setSubmit] = useState<Submit>({ kind: "idle" });

  // Debounced on-chain availability check: derive the agent PDA and see whether
  // the account already exists.
  const reqId = useRef(0);
  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed === "") {
      setAvail({ kind: "idle" });
      return;
    }
    if (!NAME_RE.test(trimmed)) {
      setAvail({ kind: "invalid" });
      return;
    }
    setAvail({ kind: "checking" });
    const id = ++reqId.current;
    const timer = setTimeout(async () => {
      try {
        const info = await connection.getAccountInfo(agentPda(trimmed));
        if (id !== reqId.current) return; // superseded by a newer keystroke
        setAvail({ kind: info ? "taken" : "available" });
      } catch {
        if (id === reqId.current) setAvail({ kind: "error" });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [name, connection]);

  const canRegister =
    connected &&
    !!publicKey &&
    !!anchorWallet &&
    avail.kind === "available" &&
    submit.kind !== "simulating" &&
    submit.kind !== "signing" &&
    submit.kind !== "confirming";

  async function handleRegister() {
    const trimmed = name.trim();
    if (!anchorWallet || !publicKey || avail.kind !== "available") return;

    try {
      const program = getProgram(connection, anchorWallet);

      // Build the register_agent transaction. Method + arg + account names are
      // taken verbatim from lib/hound_tag.json (registerAgent(name, metadataUri);
      // accounts: owner, config, treasury, agentTag, systemProgram).
      const tx = await program.methods
        .registerAgent(trimmed, metadataUri.trim())
        .accountsPartial({
          owner: publicKey,
          config: configPda(),
          treasury: treasuryPda(),
          agentTag: agentPda(trimmed),
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.feePayer = publicKey;
      tx.recentBlockhash = blockhash;

      // SIMULATE FIRST — never spend the fee on a transaction that would fail.
      setSubmit({ kind: "simulating" });
      const sim = await connection.simulateTransaction(tx);
      if (sim.value.err) {
        setSubmit({
          kind: "error",
          message: friendlyError(sim.value.err, sim.value.logs ?? undefined),
          logs: sim.value.logs ?? undefined,
        });
        return;
      }

      // Simulation clean — sign, send, confirm.
      setSubmit({ kind: "signing" });
      const sig = await sendTransaction(tx, connection);
      setSubmit({ kind: "confirming" });
      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      setSubmit({ kind: "done", sig, name: trimmed });
      setAvail({ kind: "taken" });
    } catch (e) {
      setSubmit({ kind: "error", message: friendlyError(e) });
    }
  }

  const busy =
    submit.kind === "simulating" ||
    submit.kind === "signing" ||
    submit.kind === "confirming";

  return (
    <section className="panel rounded-lg p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full live-dot" aria-hidden="true" />
        <span className="stamp-label text-phosphor-glow">Live registration</span>
      </div>
      <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-[0.02em] deboss sm:text-4xl">
        Register your agent
      </h2>

      {/* Success state replaces the form. */}
      {submit.kind === "done" ? (
        <div className="mt-6">
          <div className="provenance rounded-lg border border-phosphor/45 p-6">
            <div className="stamp-label mb-2 text-phosphor-glow">Registered ✓</div>
            <p className="text-steel-100">
              <span className="font-display text-xl font-bold uppercase tracking-[0.03em]">
                {submit.name}
              </span>{" "}
              is now a Hound Tag on X1 mainnet.
            </p>
            <a
              href={`${EXPLORER_TX}${submit.sig}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block break-all font-mono text-sm text-phosphor hover:underline"
            >
              tx {submit.sig} ↗
            </a>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`/agent/${submit.name}`}
                className="rounded-md border border-phosphor/50 bg-phosphor/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-phosphor-glow transition-colors hover:bg-phosphor/20"
              >
                View reputation surface
              </a>
              <a
                href="/kennel"
                className="rounded-md border border-steel-600 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-steel-200 transition-colors hover:text-steel-100"
              >
                See it in the Kennel
              </a>
            </div>
          </div>

          {/* Next: make it live — the tag is registered but STALE until it checkpoints. */}
          <div className="mt-4 rounded-lg border border-steel-700 p-5">
            <div className="stamp-label mb-1.5 text-rust">Next · make it live</div>
            <p className="text-sm leading-relaxed text-steel-300">
              Your tag exists — but it reads{" "}
              <span className="font-mono uppercase text-rust">stale</span> in the
              Kennel until your agent checkpoints its memory. Connect it from the
              terminal to go live.
            </p>
            <a
              href="#connect"
              className="mt-3 inline-block rounded-md border border-phosphor/50 bg-phosphor/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-phosphor-glow transition-colors hover:bg-phosphor/20"
            >
              Connect your agent ↓
            </a>
          </div>
        </div>
      ) : !connected ? (
        // Not connected → prompt + connect.
        <div className="mt-6">
          <p className="max-w-xl text-steel-300">
            Connect a wallet on X1 mainnet to claim a globally unique, non-transferable
            identity for your agent. You&rsquo;ll sign one transaction; the{" "}
            {registrationFee} XNT registration fee goes to the program treasury.
          </p>
          <div className="mt-5">
            <WalletButton />
          </div>
        </div>
      ) : (
        // Connected → the form.
        <div className="mt-6 space-y-5">
          {/* Agent name */}
          <div>
            <label htmlFor="agent-name" className="stamp-label mb-2 block">
              Agent name
            </label>
            <input
              id="agent-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (submit.kind === "error") setSubmit({ kind: "idle" });
              }}
              placeholder="EchoHound"
              autoComplete="off"
              spellCheck={false}
              maxLength={32}
              className="engraved w-full rounded-md bg-transparent px-4 py-3 font-mono text-base text-steel-100 outline-none placeholder:text-steel-600 focus-visible:ring-1 focus-visible:ring-phosphor"
            />
            <div className="mt-2 h-5 font-mono text-xs">
              <AvailabilityHint avail={avail} name={name.trim()} />
            </div>
          </div>

          {/* Metadata URI (optional) */}
          <div>
            <label htmlFor="metadata-uri" className="stamp-label mb-2 block">
              Metadata URI <span className="text-steel-600">· optional</span>
            </label>
            <input
              id="metadata-uri"
              value={metadataUri}
              onChange={(e) => setMetadataUri(e.target.value)}
              placeholder="https://your-domain.xyz/agent.json"
              autoComplete="off"
              spellCheck={false}
              className="engraved w-full rounded-md bg-transparent px-4 py-3 font-mono text-sm text-steel-100 outline-none placeholder:text-steel-600 focus-visible:ring-1 focus-visible:ring-phosphor"
            />
            <p className="mt-2 font-mono text-xs text-steel-500">
              A pointer to your agent&rsquo;s public profile. Can be set later.
            </p>
          </div>

          {/* Fee + action */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-steel-700 pt-5">
            <div>
              <div className="stamp-label">Registration fee</div>
              <div className="mt-1 font-mono text-2xl tabular-nums text-phosphor-glow">
                {registrationFee} <span className="text-sm text-steel-500">XNT</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRegister}
              disabled={!canRegister}
              className="rounded-md border border-phosphor/50 bg-phosphor/10 px-6 py-3 font-mono text-sm uppercase tracking-[0.14em] text-phosphor-glow transition-colors enabled:hover:bg-phosphor/20 disabled:cursor-not-allowed disabled:border-steel-700 disabled:bg-transparent disabled:text-steel-600"
            >
              {busy ? SUBMIT_LABEL[submit.kind] : "Register"}
            </button>
          </div>

          {/* Error surface */}
          {submit.kind === "error" && (
            <div className="rounded-md border border-rust/50 bg-rust/5 px-4 py-3">
              <div className="font-mono text-xs uppercase tracking-[0.14em] text-rust">
                Not sent
              </div>
              <p className="mt-1 text-sm text-steel-200">{submit.message}</p>
              {submit.logs && submit.logs.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-mono text-xs text-steel-500">
                    Program logs
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto font-mono text-[0.7rem] leading-relaxed text-steel-400">
                    {submit.logs.join("\n")}
                  </pre>
                </details>
              )}
            </div>
          )}

          <p className="font-mono text-xs text-steel-500">
            Connected · {publicKey?.toBase58().slice(0, 4)}…
            {publicKey?.toBase58().slice(-4)} — the transaction is simulated before
            it&rsquo;s sent, so a failing register never spends your fee.
          </p>
        </div>
      )}
    </section>
  );
}

const SUBMIT_LABEL: Record<string, string> = {
  simulating: "Simulating…",
  signing: "Sign in wallet…",
  confirming: "Confirming…",
};

function AvailabilityHint({ avail, name }: { avail: Availability; name: string }) {
  switch (avail.kind) {
    case "checking":
      return <span className="text-steel-500">Checking {name}…</span>;
    case "available":
      return (
        <span className="text-phosphor-glow">
          ● {name} is available
        </span>
      );
    case "taken":
      return <span className="text-rust">● {name} is already taken</span>;
    case "invalid":
      return (
        <span className="text-rust">
          Use 1–32 letters, numbers, hyphens, or underscores
        </span>
      );
    case "error":
      return <span className="text-rust">Couldn&rsquo;t reach the network — retry</span>;
    default:
      return null;
  }
}

/** Map raw wallet/RPC/program errors to something a human can act on. */
function friendlyError(err: unknown, logs?: string[]): string {
  const raw =
    typeof err === "string"
      ? err
      : err instanceof Error
        ? err.message
        : JSON.stringify(err);
  const hay = `${raw} ${logs?.join(" ") ?? ""}`.toLowerCase();

  if (/user rejected|rejected the request|request rejected/.test(hay)) {
    return "You rejected the transaction in your wallet.";
  }
  if (/already in use|already registered|accountalreadyinuse/.test(hay)) {
    return "That name is already registered on-chain.";
  }
  if (/insufficient|debit an account|0x1\b|not enough/.test(hay)) {
    return "Not enough XNT to cover the registration fee plus account rent.";
  }
  if (/blockhash|expired/.test(hay)) {
    return "The network moved on before signing — try again.";
  }
  return raw || "Registration failed. Please try again.";
}
