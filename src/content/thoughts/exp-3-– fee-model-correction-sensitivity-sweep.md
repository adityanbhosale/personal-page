---
title: "[EXP 3] – fee model correction & sensitivity sweep"
topic: kalshi-polymarket microstructure
date: 2026-05-28T14:02:00
---
#### Findings from 3a

* stage-1 gate is now answered: corrected-taker = 0/15 flips. THERE IS NO EXECUTABLE ARB THAT SURVIVES REALISTIC TAKER FEES. 
* execution-mode gradient: 0 taker --> 1 mixed --> 7 both-maker. this is the EXP-12 thesis being quantified. Edge doesn't exist if the agent's simply crossing the spread, it only exists as it moves to passive execution.

  * The opportunity on these venues is **liquidity provision, not arbitrage**.
* Need to look into AROd re-characterization, because Build D found that arod's +5.85¢ paper edge clears the fee threshold. This now shows that +5.85¢ was mid-discrepancy, not at-the-touch spread – the executable at-the-touch spread was ~1.1¢, which doesn't clear anything.

  * Proper finding isn't that "depth binds before fees", it's that fees bind under taker; depth only binds once the PM leg flips to maker.

updated thesis about agentic arb: no capturable edge exists, at least on the taker side at any market in the panel under the correct fee structure (simulated). However, there may be opportunity to predict liquidity provision / maker side (EXP-12), or take advantage of latency / lead-lag (EXP-4), where the edge isn't to cross the spread for free, but to be on the right side before the slower venue reprices.



#### Findings from 3b

* goal here was to gain a multi-snapshot persistance understanding of the previously identified takeable subset. I then prompted to convert the single-snapshot $73-at-institutional-fee-structure result into a frequency-characterized one: across the full daemon history, how often is each of the 8 crossed markets actually crossed, how big is the takeable edge when it is, and how does it correlate across markets (i.e. single regime or independent).
* Results:

  * 100% of snapshots have ≥ 1 takeable market crossed at institutional fees across the 14.5hour measured window (Median total $190.82).
  * 5 persistent (nyk, kelce, co_pval, pe_rpal, la_kbas), 2 INTERMITENT (kr_oseh, arod), 1 RARE (co_aesp), 0 snapshot only.
  * nyk seems to be driving most of the headline – $165.89 median, 100% crossed for 14 hr straight, max $406.
  * Median |corr| across the 6 variable markets was 0.15, which makes sense since edges are largely independent, not a single regime. This is actually the most favorable structural outcome of the sweep.
  * co_aesp's EXP-3b $23 figure doesn't seem to replicate here, only 4.3% intraday, clustered in the 04Z window. The D.2 snapshot caught a transient event, not a recurring window.
  * arod showed mild TOD patterns (high 04-07Z, drop between 09-11Z, recovers 13-16Z) – partial fit to "US-business-hours liquidity." 51/51 tests still pass
* Concerns:

  * nyk at $165 median, 100% crossed for 14 hours isn't real institutional arb, of course. no actor with 0.30% access would let that sit for multiple seconds even, let alone hours. there are two possible explanations I can think of

    * (a) nobody currently has 0.30%/0.20% access on these venues – institutional fees are counterfactual, so the 'edge' sits there because no one can take it. the arb is real only at a fee tier that doesn't really exist for any market participant on kalshi/polymarket today
    * (b) adverse selection – K bid 0.30/ PM ask 0.285 are informed quotes; lifting them is structurally a losing trading because the quoters know something. the 'exclusive-fill' assumption inflates the dollar figure.
  * The key assumption now is exclusive-full at displayed depth. that's the same category error EXP-3a's direction fix caught, and is one level deeper: direction-correct but adversity-blind.
  * also, co_aesp non-replication is also a single-snapshot outlier



Key outcomes for the rest of the broader 'agentic PM terminal' build are as follows:

* institutional-fee arb result is structurally real (8 markets, mostly persistent, independent) but the persistence itself is evidence that it's not freely takeable. if 0.30% access existed for any market participant, nyk's 14-hour $165 would have been taken.

  * possibilities for why this is happening were discussed above (that fee tier doesn't actually exist, or it exists but quotes are informed/adversely-selected). In the latter case, the agent's edge is *adverse-selection avoidance*, not fee-tier-access.
* the agentic arbitrage thesis is essentially null that this point.
* new focuses of the build are as follows:

  * EXP-4 (exploiting latency / lead-lag). the Knicks market confirmed that Kalsh leads Polymarket in most cases; i'll test this with the upcoming Colombia election market resolution point this Sunday. I like this thesis because lead-lag doesn't require fee-tier access, it just requires being faster than the slower venue's pricing.
  * EXP-12 (liquidity provisioning – LP layer). EXP-3a & c provided clear anchors for this – 8 markets with provideable spread, PM rebate active means co_aesp goes from -0.000c to + 0.670x per contract when posting passive. Different agent than an arb-focused trader, this would be a market-making agent with fill risk and inventory.
