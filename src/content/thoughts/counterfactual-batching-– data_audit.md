---
title: "[Counterfactual Batching] – DATA AUDIT"
topic: ATS structures
date: 2026-06-06T00:31:00
---
#### Audit Goals:

* row counts per vneue • market • day. find the gaps (deploy downtime, market resolution)
* for one Kalshi and one Polymarket row: every field, and which timestamp is whose – exchange stamped, my receipt-stamped, or both?

  * Both venues' APIs differ here; this decides how experiment C handles the ±40ms jitter test
* depth: full ladders, top-N levels, or top-of-book only – per venue? Arm A's "price improvement distributed" claim needs at least a few levels
* trades: did the deamon capture prints, or quotes only?

  * quotes-only is fine – my markout method already models fills – but it must be stated in the writeup
* WebSocket windows: list every sub-second capture window I have – market, venue, start/end, message type (deltas vs. state snapshots). This inventory is the boundary of what Exp. C can claim
* NYK market specifically: confirm the 14.8h window's rows are intact end-to-end on both venues, since it's about to become my flagship figure



#### Audit Results:

Exp 1 (crossed-state clearance) is stronger. full ladders in the raw gz means "PI distributed across depth" is a claim I should focus on, at the cost of an extraction pass. the NYK figure is stronger: clean window, zero nulls, self-check agrees with the published numbers. I can use that chart.

Exp 2 (market decomp) must clarify "mid-markout" rather than "realized PnL", with horizon sensitivity (1/5/15 min) since frozen books bias the short end. That's a labeling thing.

Exp 3 (Interval Dial – WS tier) is not a Polymarket-only case study from one 127-minute window – an illustrative appendix, not a headline.

Exp 4 (joint cross-venue auction) isn't dead, though, and this is important to note: the audit blocked the sub-second join auction, but the joint cross-venue auction at the 30s tier runs fine off the panel – and at 30s intervals my 40ms cross-venue timestamp error is just noise.

Thesis arm survives; it lives at T ≥ 30s.'



#### Built Thus Far:

* full data inventory (DATA_AUDIT.md) – 3 capture paths mapped from writer code and verified against storage: the 30s REST panel (1.06M venue-rows, 172MD) plus 1GB of raw gz with full depth ladders (meaning Exp 1 gets real depth claims), a 5s event overlay, and one WS window. Clean on dupes, monotonicity, schema drift; honest on the gaps: 97.99% frozen consecutive books, 209 gaps including a 10.1h outage, several dead market-legs.
* reproducible replay set – 1.06M rows, content-hashed (266K gz files indeed). Any number in t he eventual writeup can be regenerated from a pinned, verifiable dataset.
* Flagship figure – knicks_spike.png. raw rows to chart, self-checked against the published finding (1,749 snapshots/venue, zero nulls, 100% crossed, median 0.5¢).
* one real bug caught and killed



#### Future Directions

* episode-collapse semantics (crossed states, not snapshot counts)
* mid-markout proxy labeling throughout
* exclusion rules applied (10 markets in, 6 out, appendix'd)
* outage scrubbed from denominators
* exp statuses
* still need to build every line of analysis logic, including the book layer, fees, auction engine, cutoffs, arms
