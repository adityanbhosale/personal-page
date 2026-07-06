---
title: "on-chain build: strengthening research/sandbox build before reg. approval"
topic: VSA Markets
date: 2026-07-06T16:12:00
---
No trader/broker/investor/MD will be able to point me to a specific informed share (X); likely only found through empirical hosting.

Actions Items Ranked by Leverage:

1. **Measurement / Observability Harness**

   * PM A/S neutrality monitor was an early prototype.
   * Instrument the sandbox so that when accredited participants trade, we *capture* informed-share signal, adverse selection, maker PnL against the subsidy bound, and price-vs-anchoring tracking, all live.
2. **Funding-tether control loop**:

   * The perp mark must track the Layer 1 spot (p) and it's currently unspecified.
   * The perp mark must track the Layer 1 spot (p) via a funding mechanism `f = k • (mark – p)`, clamped, applied per interval – a discrete-time control system whose stability depends only on `(k, interval, demand elasticity)`, not on informed share.

     * Built a funding-loop simulator, shock it with order-flow spikes, and find the stable `(k, interval)` region plus worst-case tracking error. This is what makes Layer 2 "modeled in the real sense," and I want those funding constants pinned before any deployment.
3. **Invariant suite + formal proof of the two value-conversation invariants**
4. **ABM as pilot-configuration tool**

   * choose participant count, subsidy depth, position limits, and starting liquidity from simulation rather than guesswork
5. **Deploy spot + funded perp to Base Sepolia, verified contracts**

   * minimal runnable stack, live-readable, real code not stubs
6. **Participant-eligibility + on-boarding plumbing**

   * identity-gated permissioning; KYC/accreditation gating
