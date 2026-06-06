---
title: counterfactual pred-market batching study
topic: ATS structures
date: 2026-06-05T20:54:00
---
#### Build Plan

Caveat: my panel is comprised of 30s REST snapshots + sub-second WS windows, and those two resolutions support different levels of claim. I could structure the study so every result is labeled by the data tier that earned it.

**Claim:** *Replaying observed orderbooks under counterfactual batch auctions, X% of crossed-book time clearn, $Y of displayed edge converts to price improvement for resting participant, and post-fill markout improved by Z – with the effect rising/saturating at interval length T.*

*Caveat: this is a mechanical counterfactual held under fixed order flow. Under a real batched ATS, participant behavior would adapt accordingly.*



**Data Audit:** need to inventory exactly what the daemon has. Per venue, need the following:

* top of book only or depth ladders?
* trades captured or quotes only?
* cancel/replace deltas in the WS stream or state snapshot?
* timestamp provenance (exchange-stamped vs. receipt-stamped)?

Then write the tier map: 30s panel --> auction intervals ≥ 30s and snapshot-level clearance. WS windows --> sub-second interval simulation, but only inside those windows.



**Book Reconstruction:** One module: `book_state(venue, market, t)` returning best bid/ask (+ depth where I have it), built from the snapshot panel with WS deltas overlaid where they exist.

* Normalize the two venues into a common schema with fees attached as per-venue functions.
* Deliverable is a tested layer that my old markout code & new auction engine both sit on.



**Auction Engine:** Small, well-tested uniform-price call auction: take all resting interest at a cutoff, compute the clearing price, allocate fills.

* implement *two objective functions:*

  * classic max-executable-volume
  * max aggregate price improvement
* Differences between them on the same data are themselves a finding.



**Individual Experiments:** 

* *Crossed-state clearance.* Every snapshot is a candidate auction. For each, I need to ask whether a uniform-price call would clear the crossed-dialocated states, at what price, and how many dollars of price improvement would be distributed & to whom?

  * use the NYK market as a core casse study: 15 hours of crossed book becomes – under a single counterfactual call – an instant clear at a price instide the cross, with the $166 of apparent edge being paid to the resting parties as API instead of sitting un-takeable
* *Markout Decomposition.* Re-ren my fill-realism model with counterfactual fills occurring at batch clearing prices, then compute the same 5-minute post-fill markouts. The delta between continuous-modeled and batch-modeled markout is ~= the sniping rent that batching deletes; whatever negative markout survives is genuine informed flow.

  * I showed all 8 of the curated markets had negative markout; this experiment answers how much of that is mechanism and how much is information.
* *Interval Dial (WS tier)*. Sweep T inside my sub-second windows: markout improvement and clearance rates vs. staleness cost (clearing-price deviation from the continuous mid-path, time-to-fill for marketable interest). This would output the race-resistance-vs-responsiveness thing.
* *Joint Cross-Venue Auction (thesis).* One batch clearing across both venues' merged, fee-adjusted books. This is the 'mechanism that lives above both venues' thesis I previously argued is required being tested. I could measure dislocated collapse and total PI unlocked vs. the per-venue arms. Settlement-rail impossibility acknowledged explicitly (USD vs. USDC rails); the point is sizing the prize, not claiming deployability.



**Robustness:**

behavioral endogeneity; snapshot aliasing (use WS windows to bound what 30s sampling misses); displayed-liquidity-only assumption; fee-tier sensitivity (retail vs. institutional counterfactual); clock-sync sensitivity (re-run with ±40ms cutoff jitter and show stability); cancel-behavior assumption (resting interest at cutoff treated as firm).
