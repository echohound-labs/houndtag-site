# Hound Tag

Public site for **houndtag.xyz** — verifiable agent identity and tamper-evident
memory for AI agents on X1.

Next.js 14 (App Router) · TypeScript · Tailwind. Reads the `hound_tag` program
live over X1 RPC.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional env (defaults shown) — copy `.env.example` to `.env.local` to override:

| Var               | Default                       | Purpose                          |
| ----------------- | ----------------------------- | -------------------------------- |
| `X1_RPC_URL`      | `https://rpc.mainnet.x1.xyz`  | RPC endpoint for on-chain reads  |
| `X1_EXPLORER_URL` | `https://explorer.x1.xyz`     | Base URL for program / tx links  |

## On-chain data layer

All reads go through `lib/chain.ts` — the single typed boundary:
`getConfig()`, `getAgents()`, `getAgent(name)`, `getCheckpoints(name)`.

Account decoding is ported field-for-field from the Python SDK
(`sdk/python/houndtag/chain.py`) against the layouts in
`target/idl/hound_tag.json`. The data pages are `force-dynamic`, so each request
returns live chain state (no stale prerender).

Program ID: `3zGSABr62ToeG6mC8kKzTpc5Y96AyDyTGHUS2BD3q8ee`

## Deploy to Vercel (Git-connected)

1. Push this repo to GitHub.
2. In the Vercel dashboard: **New Project → import the repo**. Framework is
   auto-detected as Next.js; `vercel.json` pins the build command and headers.
3. **Project → Settings → Environment Variables**: add `X1_RPC_URL` (and
   optionally `X1_EXPLORER_URL`) for Production + Preview. Skip if the mainnet
   defaults are fine.
4. **Project → Settings → Domains**: add `houndtag.xyz` and follow the DNS steps.

Every push to the default branch then auto-deploys to production; PRs get
preview URLs.
