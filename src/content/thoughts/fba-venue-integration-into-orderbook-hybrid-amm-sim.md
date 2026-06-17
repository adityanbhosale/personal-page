---
title: FBA Venue Integration into [orderbook-hybrid-amm-sim]
topic: Primitives – Neutral Markets
date: 2026-06-17T15:15:00
---
A Frequent Batch Auction venue simulation integrated into the existing orderbook clearing comparison repo tells us whether batching even helps, at what pi, at what immediacy cost, and for whom. If the pi-curve comes back flat, then batching doesn't help on event flow.

#### Workflow for June 16, 17.

1. Finish FBA Arm first – nearest-term, highest-certainty piece, venue's already built and tested, and it directly validates Gaps 1 and 2 (neutral matching; neutral settlement rails for on-chain event markets).
2. Latency/information wiring & pi-curve
3. The proof tells us which primitive to build.

   * If batching demonstrably protects LPs on event flow, the matching/settlement primitive is the next build.
4. Gaps 3 & 4 (execution-quality infrastructure; pre-trade privacy) will remain as thesis points in my neutral-markets paper for now.

#### §9 – Read-Only Recon before Latency/Information Differentiation Wiring (§5.2):

Specifically interested in one runtime uncertainty: that the sweep zeroes `observation_delay` for everyone. Need to know how a non-zero delay actually propagates through the event heap.





#### Got sidetracked yesterday, state as of June 17:

**4.1 – 4.3 is done and correct.**

* Venue ABC (venues/base.py), 6 methods: including submitting market orders, submitting limit orders, canceling orders, get_state() --> VenueState, estimate_impact(side, qty), tick().

  * AMM, CLOB, & hybrid all implement these methods
* Clock/cadence: the sweep fire venue.tick() once per integer timestamp via a venue_clock event at priority -50.

  * pi = clear every N ticks; just a counter in the venue, not a scheduler.
* Agents: no base class; they satisfy a PopulationAgent Protocol (observes / decide / review / fire_noise + fields observation_delay, review_interval, arrival_rate_per_unit).

  * Naive Gaussian Belief Agent
  * Tail Aware Gaussian Belief Agent
  * Aggregated Evidence Agent (cross-market)
  * Joint Factor Fair Value Agent (joint factor posterior)
  * Event Driven Noise Agent
* Latency plumbing exists but is currently OFF: observation_delay schedules a decision at now + delay, but the sweep sets it to 0 for everyone, so same-timestamp ordering falls through to heap insertion order (agent-list order)

  * turning the delays on is what would give the FBA venue something to actually neutralize
* Fair value – NO price process: truth is a static log-linear latent-factor draw at t = 0, anchored to opening mids, never moves, unbounded, no jumps
* Metrics
* Sweep
* Clearing – only continuous matching today



**4.4 FBA venue – DONE, built + tested, committed & pushed**

* venues/fba.py – canonical Budish-Cramton-Shim: resting limit book cleared by a periodic uniform-price call every tau-ticks.
* Deferred submits: submit_limit_order / submit_market_order; these both return an "accepted, pending" OrderResult (filled = 0, remaining = qty, real order_id), no synchronous fill.

  * Limits rest across batches till filled or cancelled.
* _solve_clearL candidates from limit prices, max-volume objective
* _run_clear: capture mid-Before, solve, apply book mutations, capture mid_after, stamp the same pre/post-clear mids on every full in the batch, tag liquidity ("maker" = limit leg, "taker" = market leg).
* Drain wiring: extended the Entry-2 channel rather than a parallel one – MakerFill gained liquidity & fees_paid (defaults keep CLOB/hybrid byte-identical); env drain generalized to drain_venue_fills(sim) --> _record_drained_fills.
* get_state() mid = resting-book best-bid/ask midpoint between clears. estimate_impact = approximate clearing-price move from adding qty.
* **VERIFICATION:**

  * 12 FBA tests pass (hand-computed clear, uniform price, midpoint tie-break, conservation w/ rationing, pending semantics, resting persistence + partial remainder, market expiry, determinism, clear-time-vs-submit-time mids, pi = 1 batches every tick, estimate_impact, env-drain both legs w/ clear timestamp).
  * 22 pass.



As of now, the venue is correct and cleanly recorded, but insert = with `observation_delay = 0`, there's no speed/info asymmetry for batching to neutralize, so an FBA-vs-CLOB run right now would show ~null difference by construction. Wiring that symmetry is the next task





#### Dev Tasks td:

Turn the sim into an apparatus that takes (**venue mechanism, agent population w/ latency/info structure**) and outputs 

* **LP markout**
* **taker markout**
* **adverse-selection cost**
* **and price-discovery lag per mechanism**.



**Headline figure:** pi-curve: extraction (LP markout / sniper-equivalent PnL) seen falling as the batch interval pi grows, plotted against the **immediacy cost**of waiting. This yields an optimal pi.

**Claim to Test:** a batched venue reduces information-asymmetry extraction vs. CLOB and AMM on event-contract shaped flow, at a quantifiable immediacy cost.



**5.2 – Design Point – latency/information differentiation**

1. Turn `observation-delay` on, differentiated by agent role: better-informed agents (tail-signal recipients) act on fresh signal rounds at short delay; LP-style agents quote at longer delay so their resting quotes reflect staler beliefs.
2. Wire the **signal-tier structure** (routine vs. tail signals) together with the delay so that fast access to precise tail signals is the edge a batch erases (everyone's acting on the same signal-round, and clear at a uniform price).



**5.3 – Markout Metrics**

1. Compute markout at ∆ and effective spread from TradeRecord.md_price_before/after + the liquidity tag, all **outside the hot loop**.

   * Markout is the headline metric because it maps to the bleeder that we really care about (the adversely-selected LP).
   * I'll make sure FBA fills (clear-time mids) and CLOB/hybrid fills (now symmetric after the maker fix) are computed on the same definition so cross-venue comparison is honest.
