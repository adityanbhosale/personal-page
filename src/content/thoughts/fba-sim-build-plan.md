---
title: FBA-sim build plan
topic: ATS structures
date: 2026-06-09T22:32:00
---
#### Design Requirements:

* FBA arm has to prove that a batched venue *reduces extraction*: less negative LP markout (the Thesis-B bleeder stops bleeding; users of on-chain event-contract markets).
* FBA arm has to prove that there's less value lost by uninformed takers, vs. continuous CLOB & AMM, on event-contract-style flow.
* Mechanism only works if there's a speed asymmetry to neutralize – MOST IMPORTANT. Batching protects no one if sniping isn't already happening at scale.

  * The agent population must have a latency differential: 

    * slow liquidity providers who post two-sided quotes and update with lag;
    * fast/informed traders who react to news first and pick off stale LP quotes before they can cancel orders ('sharps');
    * noise takers who provide benign flow
  * On a CLOB, the fast trader wins the race after every news move; on an FBA, the jump and the LP's repricing land in the *same* batch, so there's no pickoff.
  * **first dev task is to incorporate latency-differentiated agents**
* Event-contract flow, not generic. Fair value bounded in \[0,1] since it's a probability, slow diffusion punctuated by Poisson news shocks – discrete jumps are what create stale quotes and gie batching something to protect against. If my fair-value process is a plan random walk today, I need to add a jump component and the \[0,1] bound.
* The central knob is the batch interval pi (INDEPENDENT VARIABLE)

  * sweep pi from continuous (existing CLOB) up through ~30s (CoW-like), and show extraction collapsing as pi grows. The headline figure is sniper PnL (or LP Markout) vs. pi per venue – the batching divident as a curve.





#### Existing State of Orderbook-Hybrid-Amm-Sim repo:

* the `venue.tick()` fires once per timestamp at priority –50, before signals/decisions/trades, is a clean batch-clear seam – the FBA venue accumulates submissions during the step and clears on its tick. And `rerun_clob_and_merge` is an exact precedent for an additive fba-only run, so I wouldn't recompute 900 cells.

##### Decisions:

1. **The price process has no jumps:** I designed the whole arm around news shocks reacting stale quotes that batching protects agains. In reality, truth is a static latent-factor draw that never moves; "news" is a Poisson stream of noisy *signals* about a *fixed truth*, not jumps in the truth.

   * This means that fast traders can't pick of a stale quote after the fair value jumps (because the fair value never really jumps.
   * What does exist is informational: the tail-signal agents receive more-preceise signals
2. **Latency mechanism exists but is zeroes:** `observation_delay` schedules decisions at `now + delay` but the sweep sets it to 0 for everyone, so ordering falls through to heap-insertion/agent-list order. Clearly FBA needs delays *on* to have anything to neutralize. But given finding #1, I'll be precise about what the delay represents: it's not "reaction time to a price jump," it's "how many steps till an agent acts on the latest signal round." The fast/informed agents get short delay, the LPs get longer delay – so informed flow acts on fresh signals while LP quotes reflect older ones, and the batch is what collapses that ordering advantage. So the delay differential and the signal-tier structure (routine vs. tail signals) have to be wired *together* – fast access to precise tail signals is the edge batching gets rid of.

   * This is the experimental knob
3. **No markout, no effective spread – but `mid_price_before/after` per fill exists, both are post-hoc computable.** This is confirmed.

   * Non-negotiable to add since markout is the core headline – it's the metric that maps to the bleeder I identified before (LPs). The raw matieral's there, I'll compute markout at ∆ and effective spread from `TradeRecord` after the runs, not inside the hot loop.

The log showed OrderResult returning synchronously from `submit_*` and `MarketEnvironment._on_trade` builds the `TradeRecord` from it – so a deferred FBA full (submitted during the step, filled on tick()) breaks the synchronous-return assumption. That's the single trickiest integration point. The FBA venue has to return an "accepted, pending" `OrderResult `on submit and emit the actual `TradeRecord` at a clear time. We need to see how `_on_trade` and the trade-recording path handle a fill that arrives at tick rather than at submit, or I'll silently drop FBA fills from the metrics.

**maker-fill bug is an important finding after scraping the old repo:** when a resting limit gets hit, the maker's fill is never recorded – the CLOB just shrinks the deque tuple, no TradeRecord, no callback. So the existing CLOB/hybrid PnL already undercounts maker-side executions. This matters for two reasons

* it's a pre-existing caveat in the published-adjacent sim that I should note in build_log regardless of FBA.
* second (more importantly) if the CLOB silently drops maker fills but the new FBA venue records on both sides (which is needs to in order to compute LP markout), then FBA vs CLOB is not an apples-to-apples comparison – FBA would show more recorded volume and different PnL purely as a recording artifact, not a mechanism effect. That would be a fatal confound in exactly the headline result.
