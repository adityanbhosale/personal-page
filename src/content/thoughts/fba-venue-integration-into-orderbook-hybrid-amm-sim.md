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

**5.4 – Endogenous LP spread (this sim's edge over the frozen 1.06M row study)**

Let LP spread respond to **expected markout:** an LP sniped less under batching should quote tighter, so the welfare gain shows up as a narrower spread for everyone not just redistributed PnL. This is what lets the sim answer the question that the mechanism FBA counterfactual couldn't – *what would participants actually do under batching*.



**5.5 – Honest piece**

batching is NOT free – it trades immediacy for protection (orders have to wait up to pi ticks before clearing. I'll have to report the tradeoff, not just the dividend: if FBA cuts extraction but reduces volume or delays informed price discovery, that cost goes in the headline next to the benefit.

The most credit framing of the result is that extraction falls faster than immediacy cost rises, but only up to pi. This is a real optimum.





#### LP / Market-Maker Agent – Read-Only Recon

*The book and matching layer already support the channel we want: price priority & no self-trade prevention menas a tight LP quote gets hit first.* The only real blocker is **capital accounting: 'deployed' is monotonic and never released**, so a continuously-requoting LP exhausts its budget by construction. That's the one thind a spec must solve.



**green light:** the book + fill path, & bootstrap ladder both confirm that a real LP gets picked off. Price priority is decisive (the match loops always take `_ask_prices[0]` / `_bid_prices[-1]`), there's no self-trade prevention and no agent_id filter, so an LP quoting inside the bootstrap's ±0.1% owns best price and is hit first. Thus, adding the LP agent is enough; we don't have to rework the bootstrap.



**finding:** the LP isn't blocked by matching, it's blocked by capital accounting. `deployed` is monotonic – it only ever grows (_sync_costs accumulates, nothing decrements on fill/cancel/offset). This is mostly fine for belief agents that fire occasionally; but it's fatal for a two-sided LP that reposts both legs every review tick, since each requote commits  fresh collateral and cancel releases nothing. The LP exhausts its budget and goes silent after a few requotes.

**fix options:**

1. unbounded budget
2. release on cancel_order – how real MMs work (cancel a quote & get your collateral back)

   * risk: touches the cost-log/_sync_costs invariant that the Entry-2 maker-fix made byte-identical, so it might break the zero-delay baseline reproducibility.
3. net-inventory margin, LP-only

   * only option that's both economically faithful and preserves reproducibility.



**remaining uncertainties:**

1. capital-release model: i'll implement a net-inventory margin for the LP only
2. Claude.md says "informed-as-maker fills = 0," but handoff §4.3 reports hybrid informed_pnl moved from -6.878 --> -7.614 from "informed resting limits that got hit." so it's not exactly 0
3. no self-trade prevention --> the spec must keep LP bid < ask every quote
4. own builder vs. bolting the LP onto the existing two – the pi curve population may want a dedicated LP-vs-informed builder





**proposal:** a 5th dataclass LpMarketMakerAgent quoted via review() (long review_interval, and per §5.2 a longer observation_delay/staler belief than FAST informed): each requote it cancels prior orders, recomputes a deliberately stale mid, and returns a 2-element list, quoting inside the bootstrap's ±0.1% to own priority and absorb informed takes. gets its own ROLE_LP bucket so its markout is reported separately.

delta is the knob that §5.4's endogenous-spread arm later makes respond to realized markout. The gating decision here is to resolve UNCERTAINTY 1 first – without capital release the LP can't requote, which silently kills the channel.



#### BUILD §5.4 – LP / market-maker agent actual implementation

I prompted the LP to do two things that can't both happen – 'cancel old quotes' && 'just return a list of orders'. In order to cancel an order you need its ID, but the architecture throws the ID away when an order is placed, and there's no way to look it up later. So an LP that only returns order-lists could never cancel – it'd pull up 160+ stale quotes over a run and get picked off on garbage prices.

**Decisions:**

* option C: LP places and cancels its own orders *directly on the venue* inside its requote step, keeping the IDs itself. This mirrors how the existing bootstrap book already works, no new venue code.
* option C': keep 'return a list' literally, but add a new venue method to cancel-by-agent-id. this costs an API addition and splits the LP's actions awkwardly across two timing phases.



Decided on **option C**. manage quotes directly on the venue inside review(), mirroring the bootstrap ladder; return\[]. Proceed – build LP + builder + ROLE_LP bucket + smoke gates straight through.



#### What's built thus far:

* Diagnosed why 4a came back null: latency wiring was inert because every agent trades against the deep static bootstrap book – nobody hits anybody else's quotes, so there's no extraction to measure. The fix is a dependency the handoff had scheduled *later* *(§5.4*), so the build order got inverted: the quoting mechanism has to come before latency produces any signal.

  * built a dedicated LP/market-maker agent (B) – the bleeding liquidity provider that gets picked off – rather than just thinning the bootstrap book. This way, we're modeling the actual object my thesis is about – 
  * ran a read-only that confirmed the green light for building the LP/market-maker agent – a competitively-priced LP will get filled first (price priority, no self-trade prevention). Also, noted that capital accounting only ever grows, so a continuously-requoting LP would exhaust its budget and go silent.
  * made the capital call (option 3): isolated net-inventory margin, walled inside the LP class so the four existing agents' baselines stay byte-identical (protects my G1 reproducibility guard by construction).



#### Post LP/market-maker agent build: well-built overall

* built the complete `LpMarketMakerAgent` class
* verified the LP's `review()` will actually fire (first one at `now + review_interval`), and that the LP never enters the shared `_sync_cost/cost-log` path (its maker fills carry `capital_committed = 0`), so it owns its own deployed field – i.e., capital isolation holds, Gap 1 (neutral matching) is protected

**What the code actually does:**

* quotes a two-sided bid/ask just inside the bootstrap (`half_spread_pct` forced < 0.001, so it always sits in front and gets hit first) – this is the extraction channel
* updates its belief on a long delay (obervation_delay = 50, v FASH informed being faster) – so it's deliberately stale and gets picked off.
* `decide()` only updates belief and returns nothing: THE LP NEVER TAKES, only rests.
* tracks its own net inventory by reading the shared trade log read-only and margining the net position, never touching shared accounting.
* in `review()`: cancels its prior quotes by ID, check a solvency gate (sit out if capital used ≥ budget), reposts both legs directly on the venue, returns `[]`.

![](/uploads/screenshot-2026-06-18-at-3.36.11 pm.jpg "LP capital isolation")
