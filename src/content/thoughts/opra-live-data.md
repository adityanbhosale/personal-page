---
title: OPRA Live Data
topic: Martingale
date: 2026-10-06T23:30:00
---
DFR being filed.

Includes external distribution, 3 years of L1 history, and enhanced live data.



##### Market-Measured Wedge Model:

1. Smoke Test – locally on terminal, where key already logged. 

   * Its output answers whether a 2023 day is covered by the plan or still metered, and how far back the window goes.
   * **Results:** Dataset range shows cbbo-1m, the registered framework, available from 2013-04-01 --> today. Entire panel era is reachable (the 3yr grant is probably a billing thing, not a limiter). Cost was 6.7¢ for a full day of ABBV's chain at metered rates, and ABBV is one of the heavier chains in the panel. Two snapshot days per event across ~1000 gate events = $100-$200 even if the grant covers none of it. The capture pipeline's cost ledger absorbs that without issue.
2. Definition Pass – doesn't deal with live data.
3. Fetch-plan.

   * Backfill runs locally.
4. Measurement session – computes the statistic from committed bytes in the cloud, closes with a memo, and the figure is published next to the outcome-based 0.0815 mean-squared jump.
