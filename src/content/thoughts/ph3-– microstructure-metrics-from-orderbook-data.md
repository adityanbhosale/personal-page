---
title: Ph3 – microstructure metrics from orderbook data
topic: kalshi-polymarket microstructure
date: 2026-05-25T18:49:00
---
Design choices:

Snapshot vs. polling: phase 3 is meant to produce microstructure metrics from orderbook data, which can be approached in two ways.

* snapshot (1 fetch per market) – pull each orderbook once, compute spread/depth/mid, write to processed CSV. this way, we can capture exact moments on the books.
* polled snapshots (N fetches over a window) – pull orderbooks every 30s for 30 min while I'm working. Captures variability – spread tightness across time, depth fluctuations, quote-update frequency. ~30 min runtime.

in theory, the polled version will produce meaningfully more interesting findings (quote stability is itself a microstructure variable), but requires me to present and isn't rate-limited. I've already hit a 429 today. I'll take a snapshot approach to Ph3, and consider polling for Ph4 (where the cross-venue comparison benefits most from temporal data). Phase 3 is about establishing per-venue baselines at the end of the day.

Another design choice is what metrics to optimize for. Per market per venue, I'll look for the following:

* best bid / best ask / mid (mid could be mean simple, volume-weighted, time-weighted – recall the TODO I added in Ph2)
* spread: absolute (cents) and relative (% of mid)
* top-of-book depth: size at best bid + size at best ask
* depth @ 1 cent from mid: for context on how the book deepens over time
* number of price levels populated

Decision 3: output shape – three options. I could use a CSV per market in data/processed/, plus an aggregate data/processed/microstructure_summary.csv. I could just return the aggregate CSV. OR, I could return an aggregate CSV + a notebook (02_microstructure.ipynb) that loads the CSV, prints the table, and produces 2-3 figures (spread distribution, depth comparison, etc.). I'll take this last path.

Lastly, need to determine where the normalization lives. Currently have src/pm_micro/normalize.py as an empty placeholder from Ph1. Need to write two functions:

* `normalize_kalshi_orderbook(raw: dict) --> NormalizedBook`, which takes Kalshi's `orderbook_fp` and returns a unified (bids, asks) representation in dollar prices, both sides reconstructued
* `normalize_polymarket_orderbook(book: OrderBookSummary) --> NormalizedBook` takes Polymarket's `OrderBookSummary` and returns the same unified format

Note that NormalizedBook is a dataclass with bids: list\[PriceLevel] and asks: list\[PriceLevel], sorted appropriately.

Then src/pm_micro/microstructure.py (also empty from Ph1) is functional: takes NormalizedBook, returns the metrics dict. The goal is to produce an actual analysis library of pm_micro. Phases 1-2 were  purely scaffolding and market selection.

POST AGENT

Key finding was the OKC was the only clean pair. 

This is a clear cross-venue pair. Both venues are pricing OKC at 47-49cents probability with spreads inside ~210 bps (2.1% of mid). and critically, **complementarity holds across venues:** Polymarket YES ($0.48 bid) + Polymarket NO ($0.51 bid) = $0.99, which is correct assuming the missing $0.01 is the spread itself.

This means I now have comparable spreads, comparable prices, both venues active.

Looking at CLE, there's structural one-sidedness on Kalshi.

Kalshi YES: incomplete book

Polymarket YES: bid=0.004 ask=0.005 spread_bps=2222

Polymarket NO: bid=0.995 ask=0.996 spread_bps=10

What the agent caught is that Kalshi has 73 NO bids zero YES bids on CLE. Polymarket is pricing CLE at ~0.4% probability (Cleveland's effectively out). Nobody on Kalshi will even bid a fraction of a cent for YES – the market's so lopsided that the YES book is empty, and the asks (reconstructed from NO bids) start at $0.01. This is structural one-sidedness in extrememe-probability markets. And it's a real microstructure finding: in tail-probability markets, one venue can have a fully one-sided book while another still has both sides prices (because Polymarket's deeper retail flow generates symmetric activity even at extreme probabilities; Kalshi's lower retail activity doesn't).

Also wanted to note the 2222 bps spread on Polymarket YES (22% spread). This shows the lopsided-book midpoint problem manifesting empirically – at 0.4% probability the "midpoint" formula is meaningless and the spread expressed as bps of mid is mathematically misleading.

Looking at the NYK finding, there's clearly missing Polymarket NO tokens

Kalshi YES: bid=0.25 ask=0.27 spread_bps=769

Polymarket YES: bid=0.258 ask=0.259 spread_bps=39

Polymarket NO: PolyApiException\[status_code=404, ... 'No orderbook exists']

For one, the spread asymmetry is massive on NYK. Polymarket has institutional market-maker flow on this contract that Kalshi doesn't, or NYK is just way more actively traded on Polymarket.

Also, both venues price NYK ~25.8% probability. Same fail value, very different liquidity profiles.

Finally, Polymarket NO token returns 404. as per the Agent's interpretation, token_id might be wrong, or the NO token gunuinely has no book. Either way this is a markets.yaml data quality issue that I'll need to look into.



What's most unexpected is that the agent says CLE wrote both rows (with NONE for the missing side fields), but the total is 11 not 12. The math is 3 markets • 4 books (kalshi-yes, kalshi-no, polymarket-yes, & polymarket-no). NYK's polymarket-no failed the fetch entirely, so it returned 11 instead of 12. CLE did write both Kalshi rows even though one side was empty – the metric fields are just None for the empty side.

The goal up till now was cross-venue arb analysis across 3 markets. After this phase, I see that the dataset is more textured than that:

* OKC: the genuine cross-venue arb candidate (clean data on both sides)
* CLE: the tail-probability one-sided-book case study (interesting microstructure, but no cross-venue arb because the price is essentially 0/100)
* NYK: the spread-asymmetry case study (20x difference between venues) _ a data quality bug to fix.

Overall, three different findings rather than three replicates of the same finding.
