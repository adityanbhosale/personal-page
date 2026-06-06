---
title: pred markets <> us equities
topic: ATS structures
date: 2026-06-05T20:32:00
---
Current thesis: we're seeing institutionalization of prediction markets, but primarily on the participant and access side (i.e., Wintermute streaming two-sided quotes, FCM membership, OTC desks, ICE's data moves, etc.). The mechanisms themselves are still continuous CLOBs – we haven't yet seen batching/auction theory explicitly. The one mechanism intervention on record – Polymarket's probability-dependent taker fee – was a tax on the rent, not a redesign of how orders are matched (this is the point on time-bounding ≠ batching the matching in my FBA substack article).

*Equities got institutional participants AND eventually a mechanism response (FBAs in theory, smart markets in practice); prediction markets have the participants now arriving and still no mechanism response.*



#### What a smart market aims to do:

Removing latency rents is a substrate (batching, randomization). What makes it truly 'smart' is the optimization layer: clearing for maximal API under expressive, multi-security constraints.





#### Future directions:

1. A counterfactual batching study. I now have ~500k rows of orderbook snapshots across Kalshi & Polymarket. I could replay them under a hypothetical randomized periodic auction (varying the interval from 100ms to 500ms to 1ms) and estimate how much of the measured pathology disappears. Pathologies to watch include how many crossed-book states would clear at a uniform price, how much of the negative post-fill markout is sniping-rent that batching deletes vs. genuine adverse selection that survives.

   * Goal: batch-matching would have improved retrospective markouts by X in this asset class
2. Drop an FBA venue into my simulator. My orderbook/AMM/hybrid sweep already stress-tests venue designs against the same Bayesian trader population – adding a randomized-batch-auction arm is incremental engineering, and it gives me an experimental version of #1: same agents, continuous vs. batched, measure adverse selection, LP markout, and informed-trader welfare.
3. diff-in-diff of polymarket dynamic-fee launch.

   * Goal: did taxing probability actually improve quote stability, depth, & markouts on the 15-minute markets – or did it just move the race?
4. legging risk in event markets. Correlated contracts are everywhere in prediction markets: mutually exclusive outcomes that should sum to one, the save event on two venues, conditional structures. Anyone trading those spreads legs in sequentially today.

   * Method: measure the legging cost (how much the second leg moves against you after the first fills). If it's material, that's the demand case for atomic multi-contract execution in event markets.
5. Synthetic-NBBO / consensus-quality piece. Event markets have no consolidated reference price – I could construct one across venues and measure how often it's crossed, locked, or fading around catalysts.
