---
title: "[Counterfactual Batching] – AUCTION ENGINE"
topic: ATS structures
date: 2026-06-06T19:16:00
---
\*\*NOTE\*\* The smoke test implemented in this auction-engine build is the whole point – the new engine has to derive my published finding – crossed gross, dead at retail fees, alive at the institutional tier – from independent machinery. When that table prints AGREES, I'll have closed the loop between the Book Reconstruction phase's empirical findings & this engine, and the fee-blocked-vs-uncrossed distinction it spits out per cycle is a core figure for any write up.



The goal of building this auction engine & cutoff generation feature was the counterfactual math itself. It's essentially a deterministic uniform-price call auction that can replay at any moment of the froze panel and answer whether a crossed-market state would have cleared, at what price, with what price improvement, and under which fee regime. There's no raw data porting, it's based entirely on the frozen data collected during the DATA AUDIT phase.

`auction.py` – three execution paths:

* `clear(orders, objective, fee_tier)` – full quantity-aware single-market call auction. Feasibility is fee-adjusted per leg by the resting order's venue (buy clears at p if p + leg fee ≤ limit; sell if p – f ≥ limit). Two objectives:

  * `max_volume` (textbook call auction)
  * `max_agg_pi` (API – this is the smart market objective)
  * Tie-break: midpoint of the optimal price interval, rounded to the finer venue tick (ASSUMPTION-1). Marginal rationing: pro-rata by quantity, no time priority, largest-remainder rounding (ASSSUMPTION-2). Pure functions, Decimal throughout, no RNG.
* `clear_joint(order_a, orders_b, ...)`  – both venues merged into one book for a paired market: the primitive for Exp 4 (joint cross-venue auction thesis). Settlement-rail impossibility remains a writeup caveat, not code.
* `clearance_bounds(book_a, book_b, fee_tier)` – the price-only path for the 30s panel (where sizes are NONE): does a uniform price exist that both venues' best quotes accept after fees, what's the feasible interval, per-contract PI to each side at midpoint.

  * Infeasibility will return a reason – gross-uncrossed vs. fee-blocked – and that distinction is itself a finding to note.
  * `book_to_rders` increases if sizes are NONE, structurally preventing invented quantities from every entering the full engine.





`cutoffs.py` – `fixed_grid` and seeded randomized (gaps ~U\[0.5T, 1.5T]) generators, parameterized T from 30s to 60min for panel runs (sub-second is reserved for the Polymarket-only case study). Gap/outage-aware: a cutoff landing where `book_state` returns NONE emits an explicit `SkippedAuction` record with reasoning – never an unmarked skip. This is fully reproducible under seed.

**Validation:** 46 tests passing (15 new): hand-computed 4-order clearings on both objectives; a fixture where the two objectives choose different prices; gross-uncrossed vs. fee-blocked at different tiers; Kalshi parabolic-fee feasibility flips at extreme C; pro-rata + remainder; tie-break/tick rounding; a `clear_joint` case executing volume neither venue could alone; cutoff determinism and outage skips properly.



**Smoke-Test:** Running `clearance_bounds` over every cycle of the frozen NYK window: 100% clearable gross with median per-contract API \~0.20¢ (Kalshi side) + \~0.30¢ (Polymarket side) = 0.50¢ published cross, split at midpoint; 0% clearable at retail fees; 100% at the institutional tier. AGREES. The engine independently re-derived my initial  finding that the spread is real, retail-dead, institutionally-accessible – through entirely new machinery (this auction engine).
