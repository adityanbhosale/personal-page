---
title: "[E] – time-of-day/day-of-week autonomous polling agent"
topic: kalshi-polymarket microstructure
date: 2026-05-27T23:58:00
---
This is a background build – the idea is to open the poller now and hold it open through upcoming resolution events relating to the 16 markets in the updated dataset.

Design choices:

* include all 16 markets, including degenerate ones. whether a lighthoused book ever revives over a week is itself a datapoint. I'll tag these markets so analysis can segment active vs. degenerate markets.
* interval is 30s. it's free on rate-limits and increases time-of-day resolution significantly. only cost is the scheduler.
* metrics: reusing `fetch_snapshot.py` machinery (normalize --> microstructure --> arb mid-discrepancy), append one long-format row per market per snapshot to `data/processed/timeofday_poll.csv`, plus raw JSON dumps to the gitignored `data/raw/` as recompute insurance. no parallel fetch path.
* timestamps will be stored as UTC, tz-aware throughout. this is quite load-bearing.
* Failures should show as a null-row + error string, so as to not crash the series without detection.

At this point, the poller is running. `max_cycles=unlimited`, have some clean daemon cycles logged with 16/16 markets, 0 errors. I'll CTRL+C out of the log, but will come back in an hour to check whether per-poll ellapsed time isn't creeping higher, since we only have 20s of headroom before it collides with the 30s interval.
