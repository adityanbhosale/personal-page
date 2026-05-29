---
title: "[EXP 12] – LP backtest using existing daemon data"
topic: kalshi-polymarket microstructure
date: 2026-05-28T21:32:00
---
#### Scope

Exp-12 was initially framed as a feasibility study using the E.1 dataset and EXP-3a's direction-correct engine. That'd function as a paper backtest of Liquidity Provisioning strategy – essentially post passive at level xyz, wait, & then simulate fills. But the goal is to model *realistic-fill* behavior, which is arguably a little harder since it involves queue priority, adverse selection, fade-on-cross, etc. These are the unmodelled assumptions that most LP value figures rest on at the moment. The daemon dataset will be the primary source of data here.



#### EXP-12a: fill realism model + applying to the existing LP edges

Goal here is to build a probabilistic-fill model (queue position, adverse-selection cost, fade probability), apply it to the 8 LP-edge markets from EXP-3a/c, and replace each exclusive-fill at whatever displayed depth dollar figure with a fill-probability-adjusted expected $/contract figure. This should theoretically result in HONEST LP-edges.

First gate is calibration data. A fill-probability model needs ground truth (essentially moments where a resting order would have actually filled or not). I don't have resting orders in this dataset as is. I do, however, have 1,745 snapshots of both books at 30s resolution (which in hindsight was a good interval decision), every observed price change between snapshots (which is evidence about what would have happened to a resting order), and per-snapshot top-of-book depth, which let's us proxy queue position.

A resting order at price X fills only if the market trades through X or to X with size depleting the queue ahead. I can then reconstruct these events between snapshots – although imperfectly, since I won't be able to see intra-snapshot ticks, but still well enough to estimate full probability as a function of distance from mid, queue depth ahead, time-to-event-catalyst, and volatility regime.

Actually, thinking about it now, the 30s interval might not be clear enough. The capture window from F.1 should help calibrate around catalysts where intra-second dynamics matter the most, but that data won't be collected and grepped till a few days from now for the sake of a thorough dataset. So, for now, I'll base this fill model on 30s-resolution data, nothing that calibration around catalysts is preliminary until F.1 5s data is grepped.

**Now I need to think about adverse selection.** When the resting order fills, we need to ask WHY if filled. If it's because uninformed flow crossed the spread, I can keep the spread. If it's because informed flow knows the price is moving and lifts our order, I'd lose. Empirically, we're testing whether the mid moved against us in the second/minutes after the hypothetical fill we're modeling. I can measure this directly from the dataset. I'll market at +30s, +5min, +30min post-fill.

**If the market timestamps are systematically negative, any "edge" is adverse-selection-paid spread, which doesn't really count.**



**Findings:**

* adverse selection is pervasive – all 8 markets show negative net 5min markout. The cross-venue LP 'edge' is primarily adverse-selection-paid spread
* 1 REAL_EDGE (provisiona) / 2 MARGINAL / 3 ADVERSE-SELECTED / 2 SUB-FILL
* The 1 real-edge (co_aesp, +2.67x cross) survives only on 4 genuine fill events (crossed ~4.3% of the time per EXP-3c) – statistically too thin to mean anything.
* Exclusive-fill figures (EXP-3) all overstate realized edge by ~1-2¢/contract – i.e. a markout haircut
* nyk's gross edge is negative before markout (Kalshi maker fee exceeds the 0.4c spread) – confirms the maker-fee-bind
* arod/kr_oseh are SUB-FILL: edge is behind a 1-2¢ half-spread, P (both legs fill) < 2%.
* 79/79 green



I wanted to test for regime-impact. After slicing the EXP-21a markouts by regime to test whether adverse selection is conditional, I found the following:

* no market has a tradeable regime – zero of 8 show non-negative net 5min markout in any regime bin with ≥ 20 fills. Adverse selection seems to be unconditional within this window
* hour-of-day: underpowered (≤112 fills spread across 24 bins), 4 non-negative buns all fail the fill floor – noise, not candidates
* Catalyst proximity: 0 fills within 2h of any catalyst – nearest catalysts (Colombia May 31, Seoul June 3) are soon, so near-catalyst behavior is yet to be characterized, not negative. this is gated by F.1 more dense data grep.
* Volatility: only 2 markets have evaluable high-vol bins (co_pval, kr_oseh); both negative – consistent with "where high-vol is measurable, it's adverse."
* 79/79 green



Clear caveat to note is that markets.yaml resolution dates are year-offset to 2027/2028 – it used the correct F.1 event dates as a workaround for the catalyst slice. That's a latent data bug that's worth fixing later (the resolution_date field in markets.yaml is wrong). Although it didn't affect this analysis since the agent used real dates.
