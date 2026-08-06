---
title: market origination / pricing
topic: Martingale
date: 2026-08-03T14:11:00
---
we've been doing a lot of work on the hedging / insurance economics of event contracts in life-sciences & analogous sectors. Since the liquidity model has been the core focus of our work over the past few weeks, we want to take another detailed look at the pricing layer, LS-LMSR, dated-futures concept, & excepted square belief revision (i.e., the 'second moment' of the jump) & think about the build timeline of the underlying synthetic markets via Martingale. The hardest challenge here is figuring out how to derive a market-true price before hedgeing flow & liquidity have been committed to the market, i.e., what ML-based synthetic markets principles are necessary to be able to generate an aggregate price for each side of the contract that we can then quote to the MM & hedger?



## pricing mechanism

If our anchor pt​=E\[1A​∣Ft​] is a martingale and it settles terminally at pT within {0, 1}, then E\[∑i​(Δpi​)2]=E\[(pT​−p0​)2]=p0​(1−p0​).

Essentially, the second moment is NOT a separate object to forecast. The only free quantity is how that fixed variance budget is allocated over time. that can be defined via the concentration ratio, which is defined as below:

κ = (E\[(Δpreadout​)2]​) / p0​(1−p0​)  ∈ \[0,1]

where 1 – κ is the share bled off before the catalyst by interim data, abstracts, adcomm outcomes, enrollment updates, partner announcements. At κ = 1 a variance contract paying (∆p)^2 has fair value of p0(1 – p0) and a straddle paying |∆p| has fair value 2p0(1 – p0).

Thus, the pricing layer has to produce the following three things:

1. p0, the level
2. κ, the concentration of information at the readout point
3. σp0​​, our epistemic uncertainty about p0, which is a different thing entirely from either of the above.

everything else is derived.



let's think about this from a process perspective:

we need a value for p0 before anyone can trade / commit capital. there are two ways to get one, depending on whether the underlying stock has listed options.

if it does, the options market has already priced the readout for us, and our job is to extract rather than forecast. we could pick two expiry dates, one before the catalyst date and one after – let's call them T1 and T2. Options expiring at T2 span the event, so their prices contain the market's view of it. Options expiring at T1 don't, so they give us a clean read on the stock's ordinary volatility with the event stripped out. the difference between the two is the effect of the event.

to turn that diff into a prob., we can fit a model that says the stock at T2 lands in one of two places. there's a good outcome, drug works, stock goes to some higher level, and there's a bad on where it doesn't. the math is a two-lognormal mix, and the parameter we'd care about is the weight on the 'good outcome' branch. that weight is the market's risk-neutral PoS. the distance between the two branches tells us how big the jump is, which yields an independent read on κ from a completely separate direction, so the two numbers can be cross-checked.
