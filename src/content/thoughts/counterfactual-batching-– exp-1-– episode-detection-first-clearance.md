---
title: "[Counterfactual Batching] – Exp 1 – episode detection + first-clearance"
topic: ATS structures
date: 2026-06-06T21:24:00
---
This is the first experimental arm on the frozen panel. The goal is to detect every crossed episode across the 10 included pairs, run a counterfactual uniform-price call at each episode's first cycle under 5 fee regimes (gross / retail / retail + rebate / institutional / zero), & quantify who could have cleared what.

#### Design Decisions:

* Episode = contiguous gross-crossed cycles; ends on uncross, gap, or termination. `EPISODE_GAP_MAX = 600s` bridging tolerance, *decoupled* from book.py's unchanged 90s staleness bound – a 424s daemon gap mid-cross isn't a sign that the market's uncrossing. Bridged episodes carry `gap_adjacent` + bridged-seconds (606 episodes bridge a gap); methods state the assumption: ≤ 600s unobserved within an episode assumed continuously crossed. The sensitivity table (90/300/600s --> 300/267/241 NYK episodes) is now published; parameter doesn't drive results.
* Full-capture semantics, no duration floor, no merging across genuine uncrosses – fleeting crossings are the latency-race phenomenon, not noise. Duration-stratified reporting instead (<1m / 1-5m / 5-30m / > 30m).
* per-contract vs size-weighted always labeled, never mixed unlabeled. The caveat that flow's held fixed head the writeup.



#### Findings:

* 1,289 episodes / 10 pairs. The flagship NYK 15.15h window is the *extreme tail*, not the typical state: NYK alone is crossed in 56.5% of cycles across 9 days, in 241 distinct episodes. "Crossed" is a recurring condition of this market paid, and is detailed for the first time.
* Duration concentration: >30min bucket = 18% of episodes but 86% of crossed-minutes – persistence dominated by long adverse-selection-priced states, with a large population of fleeting crossings beneath.
* Fee-cliff holds at episode level: clearable fractions gross 1.00 / retail 0.057 / rebate 0.130 / institutional 0.774. **Part 1's access narrative holds through the upgrade from snapshots to episodes.**
* Size-weighted (real ladders): flagship episode = $468 across 132k contracts at first clearance; clearalne fractions tie out exactly with the per-contract path.
* Objective disagreement: max-volume and max-aggregate-PI choose different clearing prices in 1,864 sized rows – real-world books where the smart-market objective is not the textbook call auction.
* Kelce-market anomanly + reconciliation: kelse \~52% retail-clearable vs. Part's "0 of 15." Resolved: \~85% vintage (regime emerged \~06-02, post-dating Part 1's 05-28 snapshot; clearable fraction 21% pre-essay --> 99% post), \~0% instrument (pm_micro.arb walker reproduced 0.519 identically), ~15% fee-structure conditioner (median C=0.03; retail wall 1.10¢ in the tail vs 3.50¢ central; clearability needs both wide cross and low wall – each alone clear 0%). Part 1 is unedited; regime change is purely a Part 2 finding.

#### New Infrastructure Built:

`arm_a_clearance.py` (episode engine, stratified summaries, sensitivity, reframed sanity gate – NYK longest episode = flagship, passing), `extract_ladders.py` (scoped gz extraction, 100% both-venue coverage at all 1,289 episode starts; reconstructed top of book ties out to book.py exactly), `arm_a_sized.py` (full `clear()` on real ladders, both objectives, per tier), `reconcile_kelce.py` (reproducible anomaly adjudication), figures a1-a5 + reconciliation figure, `RESULTS_A.md` + `RECONCILIATION_KELCE.md`.

#### Caveats:

mechanical counterfactual, flow is fixed; per-contract primary, size-weighted where ladders extracted; mid-markout proxy reserved for Exp 2 (no trade tape); 30s sampling aliasing on fleeting episodes (sub-minute bucket is a lower bound); bridging assumption as above; first-clearance only – repeated-auction dynamics within long episodes note yet modeled (that's the interval-dial question, Exp 3 logic at panel tier).

**What this cross-state analysis (Exp 1) sets up:** the episode table is the spine for 2 (markout decomposition per episode – now also the adjudicator of whether kelce's retail-clearable crosses survive adverse selection, i.e., the deeper test of Part 1's thesis), 3 (interval sweep), 4 (joint cross-venue clearance at 30s tier). Ladder extraction de-risks all sized claims downstream.
