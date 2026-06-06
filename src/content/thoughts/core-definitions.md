---
title: core definitions
topic: ATS structures
date: 2026-06-05T20:08:00
---
Dark ATS – ATS are alternative trading systems. An SEC/FINRA-regulated trading venue that isn't an exchange. "Dark" = zero pre-trade transparency: no displayed quotes, no order-book feed; trades only become public when printed to the take post-execution.

Multilateral auction – many-to-many matching in one event: several buyers can clear against several sellers in the same security simultaneously, rather than the bilateral one-buyer-one-seller fills of a continuous CLOB.

Aggregate Notional Price Improvement – for one order, price improvement equals your limit price – the clearing price you got. essentially, how much better you did than the worst you said you'd accept; multiplied by the shares filled to get dollars; summed across every order and every security in the auction. that sum is the objective function the optimizer maximizes.

NBBO – National Best Bid and Offer: the best displayed bid and best displayed ask across all U.S. exchanges, consolidated via the SIP feeds. It's the regulatory reference price; dark venues must execute at or within it.

Single price per symbol – symbol is the ticker (i.e. one security, maybe AAPL). every base-environment fill in that security in that auction clears at one uniform price – like a call auction – instead of a ladder of different prices as orders walk the book

Firm orders – if matched, you're filled. No last look, no fading after the fact.

Optimization – which orders fill, how much, at what prices, to maximize API

Auction-time inputs (what Bidder Logic can condition on, computed at auction time):

* Imbalance – excess buy vs. sell interest in the symbol within the auction
* Spread – NBBO ask minus bid at that moment
* Price dislocation – how far the current price/mid sits from a comparison value (e.g., recent mid) – a "deviation from fair" guage
* Passing volume – the executable volume flowing through the auction(s); an activity-level signal
* Quote fade / NBBO consensus – instability of the reference quote: how much the NBBO is flickering/canceling, and how much the exchanges agree. Effectively a staleness detector – the equities version of the stale-quote problem aforementioned in prediction markets.

Combinatorial Optimization – optimization where solutions are discrete *combinations* (which subset of orders, in what amounts) rather than a smooth dial; the solution space explodes exponentially and generally NP-hard.

* A combinatorial auction is one where bids reference bundles or joint constraints, so winner determination is itself a combinatorial optimization – similar to the spectrum-auction lineage that OneChronos runs.

Limit Order – fill me at price X or better.

Midpoint Peg – my price floats at the NBBO midpoint, whatever it is at auction time

Target order – this is OneChronos term – the real FIX order(s) that pre-registered Bidder Logic is based on

PoP – physical network node where subscribers connect. Orders are timestamped there at the network edge on receipt, and that timestamp determines auction eligibility

Crossed markets – best bid above best ask (locked = equal).

Base environment – the default all-to-all auction pool: every order not directed into a Nexus.

Omnimarket – an umbrella spanning two or more of your Nexuses: the order is represented in all of them at once, the optimizer fills it wherever API is maximized, and fills can span multiple Nexuses at different prices
