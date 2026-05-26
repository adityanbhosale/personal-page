---
title: Ph4 – executable arb table
topic: kalshi-polymarket microstructure
date: 2026-05-25T22:45:00
---
Design Choices before building:

1. what actually counts as 'arb', and on what side?

three things could be on the arb table

* paper mid-discrepancy only. for each market, compute polymarket_mid – kalshi_mid. rank markets by absolute discrepancy. doesn't account for execution cost at all
* naive crossed-book arb. for each market, check if Polymarket's best bid > Kalshi's best ask (i could buy on Kalshi, sell on Polymarket, lock in spread). then, compute the lockable spread and the size available at top-of-book. this a bit crude, but still defensible
* full executable arb after fess: for each market, compute the spread I can actually lock in *after* round-trip transaction costs on both venues. Polymarket maker rebates, Polymarket taker fess, Kalshi $0.02/contract execution fee. Essentially, we can walk the orderbook, if there's a crossed marekt, determine how many contracts we can actually fill before the spread closes?



I'll follow all three, in order, with the last as the headline output.

2. How should I handle the YES/NO token asymmetry?

Polymarket has separate YES and NO tokens, each with its own orderbook. Kalshi treats YES and No as a single market. So, "buy YES on Kalshi" and "buy YES on Polymarket" are comparable, but  this would mean a second arb pathway: buy YES on Kalshi, simultaneously buy NO on Polymarket – if combined price < $1.00 after fees, we'll have locked in risk-free profit – in theory.

This is crucial, because it's the arb structure that exists on Polymarket but not on Kalshi (since Polymarket NO is its own tradable token). Can Lean's terminal surface this type of cross-token cross-venue trade?



To sum, Ph4 should compute two arb structures per market:

* DIRECT: YES_Kalshi vs YES_Polymarket
* Synthetic: YES_Kalshi + NO_Polymarket should sum to $1.00; profit if sum < $1.00 after fees



3. How precise should the Fee model be?

Real fees are pretty messy. Polymarket chares 0 fees for makers, ~2% for takers. Kalshi charges $0.01/contract on execution + a fee scaled to settlement; CFTC fees on top. Two paths:

* Conservative: Use round-number assumptions (2% Polymarket taker, $0.02 Kalshi execution, no rebates). Documented a conservative; real fees might be lower.
* Calibrated: Look up actual current fee schedules and code them precisely.

The conservative approach should be fine for Phase 4. I'll document the assumption – fees are approximate anyway. I'll also write a short table of fee assumptions in the README and a single function `apply_fees(side, venue, price, size)` to keep it auditable.

4. Outputs?

I'll follow the same approach as Phase 3

* src/pm_micro/arb.py – currently empty placeholder, gets implemented this phase
* scripts/compute_arb.py – reas the Phase 3 snapshot, computes arb, writes results
* data/processed/arb_results.csv – headline table of fee assumptions too
* notebooks/03_cross_venue.ipynb – loads the CSV, prints headline time, produces 2-3 figures (mid-discrepancy across markets, arb-size-after-fees, sensitivity of arb to fee assumptions)



5. Should I use the existing Phase 3 snapshot, or re-fetch?

I can either use existing, which is faster and all the data is right there & perfectly aligned with Ph3 figures. Or, I can re-fetch fresh, since markets may have moved, especially with the NBA Finals actively playing – could produce different findings.

I'll use both – run Ph4 on the existing Ph3 snapshot first to validate the pipeline works, then re-fetch fresh data and re-run to get current numbers. The re-fetched run becomes the version embedded in the Ph5 writeup. Total extra cost is ~30 API calls.



Results: markets.yaml documented. notebook rendered correctly. two figures and a summary table.

The Paper mid-discrepancy by market and structure figure shows essentially nothing at OKC (full convergence), nothing at CLE (incomplete data), and -$0.15 at NYK (negative direct discrepancy, meaning Polymarket YES is cheaper than Kalshi YES).

Figure 2: 'executable arb after conservative fees' shows flat-line zero across all three markets, both structures. thus, paper edge exists, executable edge doesn't.
