---
title: "[Counterfactual Batching] – BOOK RECONSTRUCTION"
topic: ATS structures
date: 2026-06-06T18:41:00
---
Goal was to produce a singe, trusted interface between raw daemon data and all downstream analysis: every arm queries book.py rather than touching individual CSV data. It was built entirely against the frozen replay set (1.06M rows, content-hashed in FROZEN_MANIFEST.json so every umber downstream is reproducible from a frozen dataset.

`BookState:` venue, market_id, ts, best bid/ask.

Prices were normalized to Decimal probability in \[0,1] for both venues (Kalshi cents and Polymarket decimals converted; raw values + tick sizes preserved as attributes). YES-side convention everywhere; NO views derived on demand, never stores – kills an entire class of side-convention bugs. A valid BookState requires both sides present; one-sided or error rows are treated as gaps, and are never fabricated.

### Lookups:

* `book_state(venue, market, t)` – last snapshot at or before *t*, R9-safe parsing (the embedded-newline error rows from the audit). Returns NONE – never a stale fabrication – if *t* falls in a gap beyond the 90s staleness tolerance or inside the konwn 10.1h outage (gap windows loaded from the audit inventory).
* `paired_state(pair_id, t)` both venues' legs via the existing pairing maps; NONE if either leg is unavailable.
* `is_crossed(pair, fee-tier)` / `cross_size()` – gross and fee-adjusted variants.

`fees.py`: verbatim port of the Part 1 fee models – Kalshi parabolic, Polymarket with category tiers – wrapped in four study tiers (retail, retail + PM-rebate, institutional 0.30/0.20zero) behind one `leg_fee()` signature. Pure functions, table-tested against hand-computed values at C = 0.05 / 0.50 / 0.95.

**Validation:** 31 unit tests (normalization round-trips, at or before semantics on a synthetic gap fixture, None-inside-outage, R9 multi-line fixture, fee tables, paired lookup with missing leg). The smoke test rebuilt the full NYK window through the new layer – 1,749 cycles resolved, zero NONE in-window, 100% crossed gross, median cross 0.50¢, max 1.5¢ – AGREES with both the raw spike and the published Part 1 finding. The layer independently reproduces known ground truth.

**Known Limitation (load-bearing):** `bid_sz / ask_sz` are NONE from the 30s panel – top of book prices only. Real-data claims are per-contract till the per-episode gz ladder extraction lands; the full ladders exist in raw gz (kalshi 1¢ ticks, PM 0.1¢) but aren't queryable yet. Size-weighted / depth-distribution claims are gated on that extraction.

**Design principles worth remembering:** honest absence over fabricated presence (NONE > stale state); normalizes once at the boundary, analyze in one unit space; gaps are first-class data, not exceptions; every layer must reproduce a known result before anything new is built on it.

**This has all been committed & pushed. Next step is building out the math for the auction layer.**
