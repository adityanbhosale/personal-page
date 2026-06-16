---
title: FBA Venue Integration into [orderbook-hybrid-amm-sim]
topic: Primitives – Neutral Markets
date: 2026-06-15T22:49:00
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
