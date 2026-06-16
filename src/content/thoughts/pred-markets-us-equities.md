---
title: "**pred markets <> us equities"
topic: ATS structures
date: 2026-06-16T18:16:00
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

#### Company Thesis:

Every market that acquires sophisticated participants eventually needs a mechanism response; prediction and on-chain markets are hitting that point now, the next wave of participants is machine rather than human (which is bad for continuous matching), the response is batch/optimizing clearing – "neutral matching". I want to sell that clearing layer to the flow originators who are bleeding, proven first on event markets where the extraction is easily measurable.

**Mechanism:** Batch/optimization clearing removes the within-batch speed advantage and clears everyone in a round at one uniform price. That's neutrality. CoW is the proof as a DEX ($35B+ in lifetime volume, freezing the book every ~30s and auctioning settlement to competing solvers, with the batching itself preventing MEV).

**Model:** Not a venue, it's a clearing/settlement layer. The end-customer is the flow originator (frontend, wallet, aggregator, or agent framework whose users or agents are getting picked off), who routes flow to us for protection.

**Beachhead:** event/on-chain markets.

**Expansion:** agent markets, where neutrality becomes structural





#### Refined Pitch:

**Verifiable Neutrality**: A batch auction off-chain requires you to trust the operator to actually run the batch fairly (i.e., they didn't audit the orders, didn't insert their own, they picked the clearing price fairly, and didn't reorder).

On-chain, the clearing computation can be verifiable: the batch, the orders, the objective function, and the resulting uniform price are all attestable and anyone can recompute that the clear was neutral.

Neutrality is enforced by the settlement layer.



**Most MEV solutions are mitigations:** encrypted batching kills MEV at the mechanism level. On a continuous on-chain book, the adversary isn't just a fast trader – it's a block producer, who sees your order in the mempool and if they want to, can front-run, back-run, or sandwich it. Batch auctions already collapse intra-batch ordering (everyone clears at one price, so transaction order inside the batch stops being extractable).

Taking it one step further, you could encrypt the orders till clear time (this is possible thanks to FHE & ZK). A batch auction is uniquely suited to this because it already collects orders over an interval and reveals nothing till the uniform print – so threshold-encrypted or commit-reveal submission means the block producer can't see what they'd front-run.

It's essentially a sealed-bid-batch. Off-chain mechanisms don't need this because they hide the book by being a trusted operator. This is one of the biggest gripes with on-chain markets.



\------------------

Prediction and on-chain event markets are institutionalizing fast — Wintermute streaming two-sided quotes across Kalshi and Polymarket, Galaxy's OTC desk, Clear Street as the first institutional FCM, ICE distributing Polymarket data — but they still clear on continuous order books, the same matching rule Budish-Cramton-Shim showed manufactures a speed race that taxes resting liquidity. I measured it: across 15 cross-listed markets, the visible cross-venue edge clears only at an institutional fee tier neither venue offers, and post-fill markout on the resting side is uniformly negative — the apparent free spread is adverse selection paid to whoever's fastest. Equities took a decade and a Flash Crash to answer this with frequent batch auctions; these markets have the sophisticated participants now and no mechanism response yet.

I'm building that response — a batch-clearing and settlement layer for event contracts. Orders collect over a short interval and clear at a single uniform price, so there's no within-batch speed advantage to extract; CoW Protocol is the live proof this attracts flow on-chain. The part that makes it decentralized infrastructure rather than a batch auction on a new venue: on-chain, the operator-trust a continuous market forces on you can be replaced with cryptography — the clear becomes *verifiably* neutral (anyone can recompute the uniform price was honest, no trusted operator), and sealed-bid submission encrypted until clear time removes the *information* MEV feeds on rather than mitigating it after the fact. Specialized for event-contract microstructure — bounded \[0,1] prices, discrete resolution, cross-market correlation — and sold to the flow originators whose users are bleeding, not as a competing venue, which dissolves the cold-start. I've proven the rent exists mechanically; the experiment running now is whether batching removes it under adaptive behavior — preregistered with a kill condition: if extraction doesn't fall as the batch interval grows, the primitive isn't worth building.



\----------

Prediction and on-chain event markets are institutionalizing fast but still clear orders on continuous orderbooks – essentially the same mechanism that hands a rent to whoever's fastest (i.e., MMs) and taxes everyone who provides resting liquidity through unfilled orders. we saw this in equities back when HFT became popular.

I'm working an analogous mechanism solution for on-chain event markets – essentially a batch-clearing and settlement alyer that clears everyorder at one uniform price so there's no speed advantage to extract, and minimizing reliance on trustworthy block producers via decentralized infrastructure. So,  think of verifiably neutral clearing that anyone can recompute, and encrypted order submissions that the block-producer can't front-run with their own orders.
