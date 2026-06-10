---
title: "FBA-sim: fixing maker-fill on the CLOB"
topic: ATS structures
date: 2026-06-10T17:08:00
---
Problem: when a resting limit order is filled by an incoming market order, the maker's side is never recorded as a TradeRecord – venues/clob.py _execute_buy/_execute_sell just shrink the (agent_id, qty, oid) tuple in the deque. Only the taker side reaches '_on_trade'. This means maker-side PnL and markout are undercounted on CLOB and Hybrid today, and would make any FBA-vs-CLOB comparison insignificant.

Goal: make maker fills recorded symmetrically with taker fills, WITHOUT changing matching/economics behavior – purely a recording fix.



Essentially, a trade has two sides: a taker (the person who crosses the spread to trade now) and a maker (the person whose resting limit order was sitting there waiting). Right now my simulator only writes down the taker's side of each trade. When someone's resting order gets filled, the maker's half just quietly disappears from the book without being recorded.

The fix is to record both sides every time, so each trade produces two entries (maker + taker) instead of just taker.

The whole point of the FBA simulation is measuring how badly liquidity providers get picked off – and liquidity providers are *makers.* If the maker side isn't recorded, I'd be blind to the exact people I'm trying to quantify. Even worse, the new FBA venue would record both sides while the old CLOB records one, so any difference between then could just be a bookkeeping mismatch rather than a real effect of batching. The fix makes both venues count trades the same way, so the comparison is honest.

The test that proves it worked is simple: total quantity bought should equal total quantity sold across a run. Every trade has two equal sides, so they must balance – if they don't, something's still being dropped.



#### How it Works:

* Venue --> environment fill channel. New `MakerFill` dataclass and `venue.drain_maker_fills()` (default `[]`, so AMMs are untouched and the abstract methods are unchanged. The CLOB's 4 crossing loops now buffer one `MakerFill` per resting order consumed – agent, maker side, qty, the resting limit price, order id, and the venue mid bracketing the individual consumption (including level cleanup). `HybridVenue` delegates the drain, so LP (-2) and bootstrap (-1) executions hit the tape too. Matching arithmetic is untouched – only bookkeeping lines were added inside the loops.
* Recording. _on_trade (&& execute_market_order) drains maker fills into TradeRecords with liquidity="maker", fees_paid = 0, capital_committed = 0 – maker capital was committed at rest time, so the fill charges nothing. Maker legs are appended before the aggregate taker record so the mid trajectory still ends on the post-execution mid. TradeReocrd gained liquidity: str = "taker" so the two sides are distinguishable downstream.
* The zero-qty / capital decoupling. The old zero-qty rows couldn't simply be dropped because _sync_costs reconciled agent budgets from trade_log – a fully-resting limit's capital charge lived only in its zero-qty row. So, capital flows moved to a new cost_log (one CostEntry per intent, identical amounts and timing to before), _sync_costs and the exhaustion metric now read that and trade_log holds fills only. This guarantees maker records can never double-charge or spuriously clear pending_cost – verified bit-identical delpoyed/pending_cost in the comparison.
