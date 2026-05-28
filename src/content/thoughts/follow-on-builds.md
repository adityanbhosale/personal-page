---
title: follow-on builds
topic: kalshi-polymarket microstructure
date: 2026-05-27T19:28:00
---
Non-exhaustive list of additive empirical studies & simulations to run that build off the findings of the executable arb analysis.

Current Claim: *paper discrepancies of 0.5–1¢ sit below the ~3¢ conservative fee threshold, so executable arb is zero, so value of a terminal is in observability, not capture. **Is this true?***

This claim holds for the specific markets I've sampled, at the specific times I've sampled them at, under the specific fee assumptions I've used. It's one data point against a thesis that's already been executed (Lean.xyz).

Below is a thorough map of where the experimentation can go. Organized from cheapest / most-direct to broadest.

#### Layer 1 – Re-examining current assumptions

A. **Sample markets at higher frequency**. With minute-level or sub-minute polling, I could observe intraday spread movement that's not visible to existing design.

* Hyp: *paper discrepancies briefly spike above the fee threshold during news events, then decay without notice.*
* Method: Poll both venues every 15s for 4 hours during a known volatility event and look at the right tail of the discrepancy distribution

B. **Calibrate fees properly instead of using conservative defaults**. I'd assume that real arbitrageurs on prediction market systems likely aim for closer to 0.5–1¢ round-trip fees on volume (Polymarket has maker rebates & volume tiers to optimize with; Kalshi has market-maker programs with reduced per-contract fees). I could re-run the executable arm computation under a realistic fee model – maker-side on both venues with volume-tier discounts. If the threshold drops, some of the observations become marginal arb opportunities.

C. **Account for latency, partial fills, and adverse selection in execution simulation**. The current `compute_executable_arb()` function assumes simultaneous fills at observed prices. Real cross-venue execution faces sub-second routing, race conditions with other arbitrageurs, partial fills on one leg, and the risk that the price moves between when I'd read the orderbook and when the order actually arrives.

* Method: Build a stochastic execution model with realistic latencies (e.g., 50ms – 300ms per venue) and quote-staleness, then re-run.
* Exepcted Outcome: even paper-arb opportunities lose significant edge to execution friction (i.e. 30% – 70%)

#### Layer 2 – Scale the dataset being tested

D. [***COMPLETE***] **Expand market coverage**. Three NBA Finals markets is statistically thin. I could expand to 20-50 cross-venue pairs across categories – election markets, Fed meetings, crypto price levels, sports finals across multiple leagues. Even if the coverage discovery work is painful (which I know from the previous build), a larger dataset could surface patterns that a curation of 3 markets simply cannot.

* Hyp: *Arb opportunities concentrate by category – political markets may show larger and more persistent discrepancies than sports because the venues attract different trader demographics.*

*E.* **Time-of-day, day-of-week effect**.

* Hyp: *cross-venue discrepancies are larger during low-liquidity hours (US nights & weekends) and tighter during peak liquidity. A terminal could highlight the predictable hours when arb capture is most accessible.*
* Method: use the same market set, retain snapshots of metrics per market per venue every 2 hours for a week.

F. **Event-driven dynamics**. Capture orderbook state immediately before, during, and after discrete events.

* Hyp: discrepancies blow out for tens of minutes after an event as one venue re-prices faster than the other, then converge.
* A terminal's value proposition is "be in position before the other venue catches up." This would be a directly product-relevant finding.

#### Layer 3 – Mechanism and venue-architecture studies

G.  **Decompose where the spread actually comes from**. My current spread observations are aggregates. I could decompose them by the following criteria: *hoe much of a venue's spread is structural (rule-based price tick size, fee structure), how much is market-maker inventory cost, how much is adverse selection?* This determines whether spread is something a a terminal user can avoid or just absorb.

H. **Market-maker presence detection**. I could identify which markets on each venue have institutional vs. retail-only quote provision. Poly market and Kalshi each have known market-maker programs.

* Hyp: *markets with active MMs on both sides show tight spreads but limited cross-venue discrepancy; markets with MM on only one side show wider spreads but persistent cross-venue gaps.*

I. **Synthetic-arb opportunity surface**. My existing dataset showed direct (YES vs YES) and synthetic (YES_kalshi + NO_polymarket) structures. I could expand this approach using triangular arbs across multiple markets that resolve on related events (e.g., Lakers championship + Lakers conference + Lakers division – these are all dependent events ... parlays).

* Hyp: *structural inefficiencies exist not just within a single market across venues, but across related markets on the same venue.*

J. **Orderbook imbalance as a leading indicator**. I could compute the imbalance between bid and ask sizes at top-of-book on each venue.

* Hyp: *persistent imbalance on one venue could predict the direct the cross-venue spread will move in.*
* A terminal could surface this in real-time as a leading indicator of WHERE TO POSITION

#### Layer 4 – Simulation && What-if studies

K. **Counterfactual MM strategy on the current data**. I could take my existing snapshots and ask: if a market-maker were placing both-sided quotes on both venues, what spread would they need to charge to break even after adverse selection?

* Method: run a simulated MM agent through my orderbook history.

L. **Simulate a terminal-style trader walking the cross-venue surface**. 

* Method:

  * Build a backtest where an agent observes both venues, has a terminal's hypothetical latency profile (e.g., 50ms cross-venue routing), and trues to capture observed discrepancies.
  * Compare against a naive trader using each venue alone.
  * The performance gap is the dollar value of cross-venue infrastructure.
* This is the direct answer to whether a terminal for cross-venue prediction market arb is actually valuable.

M. **Stress-test the fee threshold sensitivity**. Plot executable arb opportunity volume as a function of round-trip fee.

#### Layer 5 – Broader venue-design research

N. **Inventory-aware quoting on cross-venue books**. A terminal-style MM has visibility into both venues. Question is, how does optimal quoting change when I know the inventory on Venue A while quoting on Venue B?

O. **Quote update latency across venues**. Measure how quickly each venue's orderbook responds to trades on the other venue.

* *If Polymarket updates within 100ms of a Kalshi print but Kalshi takes 5s to react to a Polymarket print, the asymmetry itself is exploitable and a terminal can surface it.*

P. **Resolution risk model**. When CLE delisted on Polymarket but Kalshi maintained stub liquidity, that was structural information.

* Method: Build a model that predicts which markets on which venues are likely to delist or enter lighthouse mode based on liquidity and probability state.
* This is essentially the kind of risk-surface model a professional trader terminal would be designed to expose.

Q. **Bridging on-chain (Polymarket) and off-chain (Kalshi) settlement risk**. Kalshi settles in dollars same-day; Polymarket settles in USDC on Polygon with on-chain risk and gas costs. *A cross-venue trader should be able to bear settlement-currency risk that's invisible to my current execution model.*

* Quantifying this is really hard, but important.

#### Layer 6 – What this connects to in my broader work

R. **Connect to my venue-mechanism sweep**. My `orderbook-amm-hybrid-sim` finding was that hybrid CLOB + LP venues reduce agent-to-agent trade volume by 50% by absorbing noise flow. The cross-venue work is the empirical version of that question: *does a cross-venue MM layer (which is effectively what Lean is) produce the same noise-absorption property?* I have both halves of the question; the synthesis could be more valuable then either alone.

S. **Reproduce the pm-AMM analytical results empirically**. The pm-AMM paper derives volatility shape `phi • 39.9 / sqrt(steps_remaining)` from Gaussian score dynamics. My data – essentially just multiple snapshots of the same market approaching resolution – is exactly the kind of data I'd need to verify their analytical result empirically. Whether real prediction markets actually exhibit Gaussian score dynamics is itself an open empirical question.
