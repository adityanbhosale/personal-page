---
title: cross-venue empirical work on Kalshi & Polymarket data
topic: "kalshi-polymarket microstructure"
date: 2026-05-22T10:00:00
---
output: notebook + write-up + repo

goal: quantify executable arb surface across \[x] markets. the venue sweep (AMM / CLOB / hybrid) showed that LP layers in hybrid orderbooks absorb noise flow; the cross-venue data would show where that flow gets routed inefficiently in current markets. 

kalshi's market data is public (not auth required); trading requires JWT auth. the `GET /markets/{ticker}/orderbook` endpoint is no-auth, and there's an official `kalshi-python` SDK. Note that kalshi's orderbook only returns bid data due to the reciprocal pricing model – asks on YEs are constructable as `1 – bid_on_NO`. thus, i'll need to reconstruct the full book

polymarket's public endpoints like the orderbook and market prices don't require auth. they py-clob-endpoint package can be initialized read-only without a private key for get_order_book, get_midpoint, get_price. Markets are discovered via Gamma API at gamma-api.polymarket.com/markets. Each market has a condition_id (the question) and two clobTokenIds (one for YES, one for NO) – each token has its own orderbook.

this removes gating risk – no API key wait, no waiting on Polymarket support.



From the market-making strategy repo starred (https://github.com/octavi42/prediction-market-maker), it's a strategy for a *simulated* environment – not real Kalshi/Polymarket data. some useful points, however –

* regime-based methodology (the +$40/sim inflection from discovering 'monopoly mode' – when the competitor's quote disappears, true prob is extreme, and the strategy flips). this could help notice regime shifts in real cross-venue data.
* volatility shape `phi_factor • 39.9 / sqrt(steps_remaining)` independently arriving at the pm-AMM analytical form – pattern of 'empirical sweep landing on the analytical answer,' which is also the shape of the write-up i'm hoping to produce
* formatting





Build plan – `kalshi-polymarket-microstructure`

decision choices:

* pull current orderbooks for somewhere between 5-10 mapped markets, run analysis on snapshots. a short polling window (every 30s for 30 min on 2-3 markets)
* two metrics – microstructure (spread, top-of-book depth, mid) per venue per market; cross-venue (mid discrepancy, executable arb after fees). headline would be the arb table.



Phase 1 – scaffold + pipeline validation. create repo with `pyproject.toml`, two thin client modules (`clients/kalshi.py`, `clients/polymarket.py`), one notebook that pulls one known market from each venue and prints the orderbook. validates the data layer end-to-end before any mapping work

Phase 2 – market mapping. `markets.yaml`. 6-10 markets that exist on both venue. ideas:

* 2026 world cup winner (Spain / Brazil / Argentina / France / England – each is its own binary, ~5-6 cross-listed)
* Fed rate decision next meeting
* Bitcoin price > $X by end of year
* Recession in 2026
* USA midterm Senate control (Nov 2026)
* Possibly: ChatGPT-5 release, Germany / Brazil election outcomes per the Paradigm Predictions piece)



Phase 3 – microstructure extraction. for ewach market, per venue, determine: best bid/ask, mid, top-3-level depth, implied spread in cents. Normalize Polymarket's two-token structure to a single YES-price view to match Kalshi's framing

Phase 4 – cross-venue + arb. mid-price discrepancy in cents. for each market, compute executable arb size after fees (polymarket marker orders have zero fees and earn rebates; takers pay trading fees on executed orders; Kalshi has the $0.02/contract execution fee + 7% on winnings model – for cross-venue arb I'd be modeling the transaction cost, not settlement cost). output is a **ranked table of arb opportunities**.

Phase 5 – README + figures
