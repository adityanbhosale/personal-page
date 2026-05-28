---
title: "[D] – expand market coverage"
topic: kalshi-polymarket microstructure
date: 2026-05-27T21:58:00
---
settling for 10-15 pairs in this initial sweep of build D; selection criterion include minimum $50k combined cross-venue OI as the volume floor (rids the $52 World Cup markets from Phase 2), explicit stratification across probability ranges (some central 0.3-0.7, some tail < 0.1 to test lighthouse/delisting at scale), excluding anything resolving < 2 days; no additions to `markets.yaml` for now.

Agent round 1: building scripts and producing candidate table for review

* patch: edited `src/pm_micro/discovery.py` and `scripts/validate_markets_yaml.py`: replacing any 'assert len(token_id) == 77' with 'assert 76 <= len(token_id) <= 78 and token id.isdigit(), \ f"Token ID malformed: len={len(token_id)}, value={token_id\[:20]}..."

  * reran scripts/discover_markets.py from scratch (no cache layer expected).
  * regenerated data/processed/discovery_candidates.md.
* reports

  * number of previously score-zeroed rows that are now scored
  * new top-10 by match_score
  * confirmation that NBA Finals trio scores are unchanged
* WORKED: 

  * NYK bucket drift shows a real-time confirmation of Finding 3. Knicks-clinch repricing was still active during the re-run – Polymarket-Kalshi midprice continues to move in alignment ~ 36 hours after the signal. This is a clear datapoint for the "silent tracking through some channel that isn't trade execution" finding.
  * Top-10 contamination: tells us that matcher's ceiling. out of 10 rows: 1 verified true pair (Kelce), 2 plausible (CA Gov primary at #8/#10 – Becerra and Swalwell in the same race, so token-set is right for the wrong reason), 7 false positives (5 XRP date-coincidences, Trump+World Cup, Bernie+Alaska Senate). That's expected – token_set_ratio without semantic gating will keep doing this on finance/sports/geographic terms. Unfortuantely, adding more compute to fuzzy matching won't help; i'll need to review manually.
  * The recovered 6 pairs are the real output, since they span CA-11 House primary (2 candidates), AK Senate, tariff macro, Aaron Rodgers retire, and Trump attending NBA Finals. That's the category diversity the original top-10 didn't have – politics + sports + macro all in one batch.
* follow-on task (curation): produced a curated, eyeball friendly view of the 92 candidates for manual selection. didn't modify markets.yaml. didn't re-run discovery so as to keep same set of pairs identified per selection criteria. Read from data/processed/discovery_candidates.md as the source of truth.

  * Results:

    * 19 same_event is exactly the actionable set. the 55 shared_domain_only + 13 shared_entity_only confirm what I'd suspected initially, that token_set_ratio is a noisy signal, but with semantic tagging, we can pull the real candidates cleanly. The 0 same_race_diff_side is itself a finding – pm venues converge on the same candidate set per race, so there's no naturally-occurring cross-venue "A on Kalshi, B on Polymarket" structure within a single contest. this is worth noting.
    * The 13 shared_entity_only politics rows (primary-vs-general) are a different research inquiry. These rows enable a conditional pricing analysis that's structurally different from the same-orderbook-two-venues setup behind all current findings.

      * This is good D3 build content
    * So, total 13 new additions --> 16 in markets.yaml, good outcome from additional sweep

Agent round 2: add picked entries to markets.yaml and rerun Ph 3/4. keeping curation decisions gated by me.

Goals for round 2 are as follows:

* expand `markets.yaml` from 3 --> 16 entries with the 13 picks from below, fixing the validator's 3 outstanding 404 errors via explicit delisted markers, and re-run Ph3/4 on the expanded dataset.
* Gaurdrails: existing 3 markets.yaml entries must remain functional, so I don't want to alter their condition_id, token_ids, or category listing. I'm only going to add the delisted markers per the spec.

  * Use the new discovery.py helpers; don't introduce parallel fetch patchs
  * use the loosened ID validation (76 ≤ len(token_id) ≤ 78 AND isdigit)
  * no new `src/pm_micro/` modules. new files allowed under scripts/, data/, notebooks/ per the my allowance for new code organizations
  * on any fetch failure, the agent should stop and report rather than automatically retrying the fetch.
* To-dos:

  * write scripts/expand_markets_yaml.py (fetch + validate 13 picks, resolve LA/Cultural pitcks, build merged yaml)
  * run expansion script; inspect resulting markets.yaml
  * run validate_markets_yaml.py – must exit 0
  * run fetch_snapshot.py + compute_arb.py --fresh
  * run pytest to ideally return 6/6
  * report + commit the added 13 to markets.yaml
