---
title: FBA Venue Integration into [orderbook-hybrid-amm-sim]
topic: Primitives – Neutral Markets
date: 2026-06-19T17:56:00
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





#### LP/market-maker agent not actually bleeding:

these finds came after the smoke tests were run. the LP isn't bleeding (return sign was positive, which is a modeling insight, not an incident of the inputs I provided).

* G1 Byte-Identical – the diverse/clob baseline is provably unchanged (working tree vs. committed, via stash). `informed_pnl_total`, `lp_rent_total=-742.36`, `n_trades=60` all identical. Capital isolation held; the incumbent path was untouched (_sync_cost/cost-log)
* G2(a) – passed – 18 LP fills (was ~0). the channel exists
* G2(b) – failed – LP PnL +0.87 (profitable). the 'failure'
* G3 – passed – 61% fills in 2nd half. solvent
* G4 – passed – deterministic



**core finding from new sweep w/ LP-market-maker-agent:**

*observation_delay against a static (frozen) truth doesn't make the LP wrong, it makes it slower to converge to the right answer. A delayed-but-unbiased belief still centers on true fair value. and a market maker quoting a spread around an approximately-correct fair value earns the spread by construction – it buys below fair, sells above fair.*

***The LP only bleeds if it's filled* disproportionately on the wrong side, which requires its belief to be biased, not just lagged. Two ways to manually bias it for this backtest:**

1. truth moves and the LP's quote goes stale
2. the LP is genuinely worse-informed than the takers, so the takers systematically know something the LP doesn't





### **Information Asymmetry >> Observation Delay / Latency**

**My thesis is that verifiable batching reduces *information-asymmetry extraction*, not 'latency arbitrage' alone. This sweep with a dedicated LP/market-maker agent w/ a dedicated observation-delay parameter proves that latency-without-information-asymmetry produces NO EXTRACTION.**

*When we do build the FBA arm and (hopefully) show that batching reduces the bleed for liquidity providers, I'll know the bleeding is coming from the right source, not any modeling/parameter artifact I can hard code into the simulation.*



### Reverting Frozen Truth – NO RANDOM WALK

We initially frozen truth so that convergence to true probability is a well-defined target and markout is clean. If truth wanders, I'd have to decide what the LP is even being marked against – terminal fair? fair-at-fill-time? – and adverse selection vs 'the walk just moved against the agent' becomes a hard question to answer.

A walk also has a volatility parameter, which introduces a new free knob.



**Options for Reverting Frozen Truth Effect on Reverse Adverse Selection:**

* Path A – Moving Truth – test whether the latency channel already produces adverse selection once truth moves, before adding any information asymmetry. This is more faithful to my thesis and tests the mechanism I've already built. There's no precise-degredation parameter.

  * Cost: bigger blast radius (shared env, not an isolated class); needs a fresh baseline definition; needs the markout-window decision to avoid confounding adverse selection with inventory risk; adds a walk-vol parameter to deal with
* Path B – Option 1, degrade information – isolated to the LP class, keeps the frozen-truth baseline intact, smaller and cleaner change, directly instantiates that "informed agents have better signals".

  * Cost: different extraction mechanism (information asymmetry) than the one I've built (latency), and it sidesteps the question of whether my latency mechanism works at all.

**I'll follow Path A since I've already identified a meaningful gap in the world.**







### **BUILD – Phase: markout-at-fill-time rework.**

Per the moving-truth recon, _trade_mtm_pnl (rent.py) and rent_and_pnl/pnl_by_role take  fair_prices_by_market as ONE scalar per market and apply to every fill, IGNORING rec.timestamp. Against any non-static truth this measures inventory risk, not adverse-selection – and even in the frozen world, marking the LP's fills against terminal fair rather than fair-at-fill-time muddies the adverse-selection read. This phase makes markout **time-aware**. It changes the MEASUREMENT only – no agent behavior, not truth process, no world change. Truth is still frozen this phase, but that'll soon change as well.

**Recap:**

* Built: time-indexed fair-value marking. FairValueAt accessor + `frozen_fair_value()` favtory in rent.py; each fill is now marked against `fair(market, timestamp)` instead of a flat scalar; sweep.py threads a frozen accessor through; new test_markout_fill_time.py. Terminal-fair marking still available (AMM lp_rent deliberately keeps it).
* Gates:

  * G-MARK byte-identical (the load-bearing no-op invariant).
  * G-REG 29 passed / 1xfailed / 1 failed = the *known* G2b LP-positive, unchanged.
  * G-DET deterministic
  * G-FUTURE the artificial two-point series proves time-indexing actually fires (fill@t4000 marks at 110, total +10 – not terminal's 20, not t0's 0). All green.



#### 'Variable Truth' Build

(a) the markout rework is now down

(b) a deterministic walk path + threading the timestamp into signals is a contained build

(c) convergence-metric retarget

(d) the belief-model decision is still a bit uncharted, and touches every agent

*I'll pursue building a more faithful environment since a frozen truth fundamentally cannot express the thesis around FBAs in multi-agent worlds & LP adverse selection.*



* *Right now, every agent uses a `guassian_scalar_nif_update` as the underlying belief model, which assumes a stationary target.* If I was to run that model against a moving truth, every agent's posterior would lag and over-weight stale signals – so the LP bleeds, but so does the interpretation since we can't tell if the LP was picked off by better-informed takers, or if everyone's mis-specified filter cannot track a moving target.
* Recon:

  * In this existing belief model, lag is governed by accumulated precision (more precision --> lower gain --> more lag)

    * precision accumulates at variable rates per class because `obs_precision` is deliberately class specific

      * The Tail agent's `obs_precision` is \~2k–40k per signal, so after one tail draw, its precision explodes, its gain collapses to \~0, and its belief freezes – **so against a moving truth, my best-informed agent tracks the moving truth the worst**
      * The Naive/LP agents (fixed ~0.5-0.7k per signal) stay responsive and track better.
  * Under the old model, a moving truth would show the LP **outperforming** the informed agents – not because of any real information/latency asymmetry, but because the informed agents' filters freeze faster (just math). The bleed is inverse.
* **faithful environment requires a Kalman step**

  * can't get an interpretable moving-truth result from the precision-only filter. better approach is to add a time-aware update with process variance `q` (decay prior precision by `q•∆t` before absorbing each signal), at both update sites (the scalar helper and joint-factor's own ∆-shrink), gated on `q>0` with a hard short-circuit at `q=o` so the frozen world stays byte-identical.
  * each agent's `q` equal to the truth's actual walk variance, making them correctly-specified trackers
  * then a delayed agent is an *optimal tracker* that simply updates later, so its staleness is genuine (the thesis) rather than a filter pathology



#### Kalman time-aware scalar belief update

* `gaussian_scalar_nif_update` gains keyword-only `q=0.0, dt=0.0` with a hard short-circuit; the 4 scalar agents (Naive, Tail, Agg, LP) each get a q field, a `_last_update_tick` dict, and `update_posterior(signal, now)` computing per-market ∆t; `sweep.py` threads `belief_process_var` (default 0) through to the scalar constructors. Joint-factor is untouched
* At this point, the markout process is time-indexed, and the Kalman belief model is commited

  * next step is to built the joint-factor matrix ∆-shrink, and then the walk itself with q = walk-variance so agents are correctly specified trackers, then finally a convergence-metric retarget

#### Build: markout re-point to the walk path (fair-at-fill-time against a moving truth.

*The markout time-indexing rework (commit 9b2b8d5) built a FairValueAt accessor; now it's fed frozen-fair-value (constant per market). Phase B left markout still marking against the t=0 truth. Against a MOVING truth, however, marking a fill at terminal/t=0 fair instead of fair-at-the-fill's timestamp measures INVENTORY RISK (the LP held a position while the walk drifted), not adverse selection. This step points the markout accessor at the walk PATH so fills are marked against path\[m, t_fill] – the prerequisite for an interpretable LP bleed.*

RECAP:

* markout is re-pointed to read the walk path. New helper `_walk_path_fair_value(info_env, until_ts)` returns a `FairValueAt` giving true fair price at each fill's tick (reuses the log_fair_value_at accessor from Phase b); ru_single_simulation swaps it to when walk_var>0m keeps frozen_fair_value at walk_var=0. sweep.py +18/-5, new test.
* All gates green: G-ID byte-identical at walk_var=0 (full precision), G-MARK-PATH (accessor genuinely reads `path[m, t_fill]`, late fills differ from t=0 by > 1e-3), G-INV-vs-AS check, G-RED 45 passed / 1 xfailed / known-G2b, G-DET deterministic



#### Integrating the FBA venue as a runnable sweep mechanism.

"fba" added to `MechanismName`/guard; `_fba_venues_from_truth(τ)` builder; `tau_ticks` threaded through; `drain_venue_fills` wired into `_pulse`; and – the P1 catch – `FBAVenue` added to the `route_log_space_trade` dispatch so informed agents can trade on it



### Measurement – the FBA result, paired by seed.

The wiring probe (single-seed, unconfirmed) already showed that under the walk, FBA (pi = 1) bled ~8.5x less than CLOB (-19.8 vs. -170), and the bleed was roughly FLAT across pi (pi = 1: -19.8, 10: -19.4, 50: -21.4, 200: -18.3). So the protection looks like a DISCRETE STEP at the mechanism switch (continuous CLOB --> uniform-price batch), largely pi-dependent – not a smooth pi-slope. This measurement will confirm or deny that, properly, paired across seeds.

**Core Question:** *does switching from the continuous CLOB matching to FBA uniform-price clearing robustly REDUCE the LP's latency-driven bleed, measured as a paired-by-seed difference?*

**Secondary Question:** *does longer batch interval pi reduce it FURTHER, or is it flat in pi (as the probe suggests).*



### **FINDINGS:**

**switching from continuous CLOB matching to FBA uniform-price batch clearing robustly reduces the LP's latency-driven bleed.** 



paired rediction +86.6, SEM 6.7, \~13σ, 95% of seeds reduced. The LP's markout goes from \~-92 (CLOB) to ~-5 (FBA). The pairing did exactly what it was designed to do: the ±72 per-seed walk noise collapsed to a paired SEM of 6.7, so the reduction is overwhelmingly significant even through the absolute bleeds are noisy.



**The kill condition was not med – batching curbs the extraction.** The thesis is proven end-to-end in a moving truth environment.



**Validity Checks:**

the shape is a clean step, and the agent confirmed it's genuine per-fill protection, not an artifact of the parameters I set.

The transfer check is honest. As the LP bleeds less (+87), the informed gain shrinks (\~-50), so the extraction is prevented, not relocated – directionally. The agent flagged it's not 1:1: the LP improves +87 while informed gain drops only \~50; the gap goes to lower traded volume and the bootstrap/noise counterparties. So the honest read is "directionally a prevention, not a clean conversation."

**batching prevents extraction, but we can't yet claim a clean wealth-conservation identity.**



***in a faithful moving-truth simulation with correctly-specified agents, switching from continuous matching to frequent batch auction reduces the liquidity provider's latency-driven adverse selection by ~95% (paired reduction +86.6 ± 6.7, 13σ, 95% of seeds), with the protection coming from uniform-price clearing itself rather than the batching interval, and the extraction prevented rather than relocated.***
