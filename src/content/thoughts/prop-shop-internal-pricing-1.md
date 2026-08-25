---
title: Prop-Shop Internal Pricing
topic: Martingale
date: 2026-08-25T17:54:00
---
Might want to consider the validity / acceptance of internal pricing from the liquidity providers.

XTX Markets?



In a bilateral market with one quoting side, the hedger has no independent price check. This is the 'guaranteed discount' objection: the MM prices off internal theo, and the client needs a reason to believe the market isn't extraction.

Here's how OTC markets already solve this: **independent price verification (IPV) practice at banks**, and consensus pricing services for illiquid derivatives.

* OSTTRA Totem – this is the consensus services that dealers submit marks to for untraditional asset classes
* EU prudent-valuation rules



Here's how `Martingale` proposes to address internal pricing: the pricing panel and the published anchor.

**Open Question:** Does Martingale as broker publish a house mark, commission a third-party mark, or structure quotes as spreads to a public anchor? There's work to be done via `~/martingale-pricing` to learn more about the internal pricing run by prop shops looking into exotics.

We can't observe a prop shop's internal pricing of course, but we can observe its outputs. Each of our prior capture CLI photographs is a measurement of how the industry's internal marks behave into a binary event. The decision-eve series we already have with CAPR's chain dying from 7 OTM at 10:00 to `refused_fit` by 13:00, half spreads at 0.50, RARE's spread going from 0.75 to 0.30 through a morning, is all the "conservative theo adjustment" we already know exists.



1. **MM retreat curves – can run on the existing ledger.** This analysis would pass over `quotes.jsonl` and the raw cache that plots, per event, half-spread, OTM count, and fit status against hours-to-event.

   * Prop shops widen and withdraw on a measurable schedule, and the schedule is the hedge-cost floor any warehouse quote will sit on.
2. **Anchor coverage.** We're interested in how often the public anchor exists at all. We could run capture and fit across the catalyst universe (historical at-time mode on past PDUFA dates works without waiting on live events) and tabulate event_priced vs. refusal by market cap, chain depth, and days-to-event. If the anchor prices for most of the 13F-derived universe, spread-to-anchor is a viable internal convention; if it prices for a third or it, we'd know that anchor is coverage-conditional, i.e., anchor-referenced where the coverage exists & house-market where it doesn't.
3.
