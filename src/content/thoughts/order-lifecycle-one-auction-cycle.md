---
title: Order Lifecycle (One Auction Cycle)
topic: ATS structures
date: 2026-06-05T15:18:00
---
1. Entry – broker sends a Limit or Midpoint Peg order – or a Target Order that references pre-registered Bidder Logic, making it an Expressive Bid.

   * Orders are firm; book is dark – no feeds, no pre-trade transparency.
2. Timestamping at the edge. Orders are timestamped at the network level at the Point of Presence (PoP) as received. THAT timestamp (not arrival at the matching engine) determines auction eligibility.
3. Cutoff – each auction's cutoff time is drawn AT RANDOM (20-200ms after the previous auction completes), cannot be gamed.
4. Pre-match checks

   * locked/crossed market tests
   * subscriber-configured risk checks
   * erroneous-order flagging
5. Solve (matching engine) – optimization determines the configuration of buys and sells that maximizes **total Aggregate Price Improvement**

   * (limit price minus clearing price) • filled quantity
   * summed across all orders and all securities in the auction
   * One clearing price per symbol per auction in the base environment
   * multilateral fils.
   * makes an NP-hard combinatorial solve run 10 times a second since the engine rubs probabilistic search and RL techniques to scale and allocate compute
6. Symmetric Release – post-matching, results broadcast to all PoPs, and each PoP holds them till a predetermined moment before the next cutoff, then disseminates execution reports simultaneously

   * speed is neutralized at both ends: random entry cutoff going in, synchronized release coming out
   * NOBODY CAN LEARN THE AUCTIONS RESULTS EARLY ENOUGH TO RACE THE NEXT ONE
7. Settlement
