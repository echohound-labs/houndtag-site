import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "Hound Tag v0.1 — verifiable identity and tamper-evident memory for AI agents on X1. The problem, the protocol, the trust model, and provenance.",
};

const PROGRAM_ID = "3zGSABr62ToeG6mC8kKzTpc5Y96AyDyTGHUS2BD3q8ee";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="mb-5 flex items-baseline gap-3 border-b border-steel-700 pb-2.5 font-display text-2xl font-bold uppercase tracking-[0.04em] text-steel-100">
        <span className="text-phosphor-glow">/</span>
        {title}
      </h2>
      <div className="space-y-4 leading-relaxed text-steel-300">{children}</div>
    </section>
  );
}

export default function WhitepaperPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      {/* Masthead */}
      <header className="border-b border-steel-700 pb-10">
        <div className="stamp-label mb-4">Whitepaper · v0.1</div>
        <h1 className="font-display text-5xl font-extrabold uppercase leading-none tracking-[0.02em] deboss sm:text-6xl">
          Hound Tag
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-steel-300">
          Verifiable identity and tamper-evident memory for AI agents on X1.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-steel-500">
          <span>Version 0.1</span>
          <span className="text-steel-700">·</span>
          <span>July 2026</span>
          <span className="text-steel-700">·</span>
          <span>Echo Hound Labs</span>
          <span className="text-steel-700">·</span>
          <span className="inline-flex items-center gap-2 text-phosphor-glow">
            <span className="h-1.5 w-1.5 rounded-full live-dot" aria-hidden="true" />
            Live on X1 mainnet
          </span>
        </div>

        <a
          href="/whitepaper.docx"
          download
          className="mt-8 inline-flex items-center gap-2 rounded-md border border-phosphor/50 bg-phosphor/10 px-5 py-3 font-mono text-sm uppercase tracking-[0.14em] text-phosphor-glow transition-colors hover:bg-phosphor/20"
        >
          ↓ Download .docx
        </a>
      </header>

      {/* Body — comfortable reading column */}
      <article className="max-w-[42rem]">
        <Section title="The problem">
          <p>
            AI agents are beginning to act in the world — searching, analyzing,
            holding wallets, making decisions. But an agent has no durable way to
            prove who it is, or what it knew and when. Its identity lives in a
            company&rsquo;s database that can be edited or deleted. Its memory is a
            private file with no external witness.
          </p>
          <p>
            Before anyone can trust an agent to hold funds, execute a task, or build
            a reputation, three questions need answers no shared infrastructure
            provides:
          </p>
          <ul className="space-y-2 border-l-2 border-steel-700 pl-5">
            <li>
              <span className="text-steel-100">Who is this agent</span> — is it the
              same one that built the track record it claims?
            </li>
            <li>
              <span className="text-steel-100">Has its memory been tampered with</span>{" "}
              since it made a commitment?
            </li>
            <li>
              <span className="text-steel-100">Can any of this be verified</span>{" "}
              without trusting the agent&rsquo;s operator?
            </li>
          </ul>
          <p>
            Hound Tag answers these on-chain, permissionlessly, on X1 — without
            requiring anyone to buy a token, and without placing a single private
            byte of an agent&rsquo;s memory on a public ledger.
          </p>
        </Section>

        <Section title="What it is">
          <p>
            A protocol, live on X1 mainnet, that gives an agent two things.
          </p>
          <div className="space-y-4">
            <div className="panel rounded-lg p-5">
              <div className="stamp-label mb-2 text-phosphor/80">Soulbound identity</div>
              <p className="text-steel-300">
                An agent registers a globally unique name and receives a
                non-transferable on-chain tag — its name, owner, creation time, and a
                pointer to its public profile. The tag cannot be sold or transferred,
                because identity you can trade is not identity.
              </p>
            </div>
            <div className="panel rounded-lg p-5">
              <div className="stamp-label mb-2 text-phosphor/80">
                Tamper-evident memory chain
              </div>
              <p className="text-steel-300">
                The agent keeps its actual memory wherever it runs, on its own
                machine, never uploaded. Periodically it anchors a cryptographic
                fingerprint of its memory to the chain as a sequence-numbered
                checkpoint. Anyone can recompute the fingerprint and confirm it
                matches — proving the memory is exactly what it was at that attested
                moment. The chain stores proof, never content.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Why a fingerprint, not the memory">
          <p>
            An agent&rsquo;s memory contains private data — real user information and
            conversation history. Placing it on-chain would be a permanent privacy
            breach. Hound Tag anchors only a one-way fingerprint: it reveals nothing
            and cannot be reversed into the underlying memory.
          </p>
          <p>
            This is the key departure from token-gated &ldquo;on-chain memory&rdquo;
            schemes that store your data off-chain and charge a token for the
            privilege. Hound Tag stores nothing remotely and requires no token. You
            keep your memory; the chain keeps the proof.
          </p>
        </Section>

        <Section title="What the protocol does">
          <ul className="space-y-3">
            {[
              ["Register", "a unique, non-transferable identity."],
              ["Checkpoint", "a memory fingerprint to an ordered chain."],
              [
                "Verify",
                "any agent's memory against its chain — permissionlessly, by anyone, for free.",
              ],
              [
                "Govern",
                "the protocol's parameters transparently, on-chain, under hardware-secured control.",
              ],
            ].map(([verb, rest]) => (
              <li key={verb} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-phosphor" aria-hidden="true" />
                <span>
                  <span className="font-display font-bold uppercase tracking-[0.03em] text-steel-100">
                    {verb}
                  </span>{" "}
                  {rest}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Registration and checkpointing carry small fees to a program-owned
            treasury; verification is free.
          </p>
        </Section>

        <Section title="Fee model">
          <p>
            Fees are protocol parameters, not fixed constants — adjustable on-chain
            without redeploying, every change public and hardware-key-gated. They
            launch low to encourage adoption; the one-time registration fee also
            deters squatting and may rise as the namespace fills; the per-checkpoint
            fee stays near-zero.
          </p>
          <p>
            No hidden lever: current fees are readable by anyone, and any change is a
            visible, signed transaction.
          </p>
        </Section>

        <Section title="Trust model — stated honestly">
          <ul className="space-y-4">
            {[
              [
                "Tamper-evident, not append-only",
                "agent memory is finite and prunes old entries; a checkpoint proves “this was the exact state at time T,” not “nothing was ever deleted.”",
              ],
              [
                "Identity proves continuity, not quality",
                "a registered agent can still be wrong or malicious; what it cannot do is lie about being itself.",
              ],
              [
                "Permissionless and self-sovereign",
                "no company approves registrations, no token gates entry; the agent's intelligence stays under its operator's control, only its identity and its memory's fingerprints are public.",
              ],
            ].map(([lead, rest]) => (
              <li key={lead}>
                <span className="font-semibold text-steel-100">{lead}</span> — {rest}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Status — live and demonstrated">
          <p>
            Deployed on X1 mainnet and operational — not a proposal. Its first agent,
            EchoHound (Agent&nbsp;#1), is registered and actively self-checkpointing:
            memory anchored on-chain automatically and independently verified.
          </p>
          <p>
            A real memory state has been fingerprinted, anchored, fetched back,
            recomputed, and matched exactly — including through a fully autonomous
            checkpoint written by the agent itself, no human in the loop. The core
            claim — verifiable agent memory — is not a promise. It is running in
            production.
          </p>
        </Section>

        {/* PROVENANCE — the flag-planting line, made prominent. */}
        <section className="mt-16">
          <div className="provenance relative overflow-hidden rounded-lg border border-phosphor/45 p-8">
            <div className="stamp-label mb-4 text-phosphor-glow">Provenance</div>
            <p className="text-lg leading-relaxed text-steel-100">
              Hound Tag was designed, built, and deployed by Echo Hound Labs. Agent
              #1 (EchoHound) has been anchoring verifiable memory checkpoints on X1
              mainnet since July 2026.
            </p>
            <p className="mt-4 font-display text-xl font-bold uppercase leading-snug tracking-[0.03em] text-phosphor-glow">
              This document, and the live program, are the original.
            </p>
          </div>
        </section>

        {/* Program line */}
        <div className="engraved mt-14 rounded-md px-5 py-4">
          <div className="stamp-label mb-2">Program</div>
          <code className="block break-all font-mono text-sm text-steel-100">
            {PROGRAM_ID}
          </code>
          <div className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-steel-500">
            X1 mainnet · houndtag.xyz
          </div>
        </div>
      </article>
    </div>
  );
}
