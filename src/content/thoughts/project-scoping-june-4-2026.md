---
title: project scoping June 4, 2026
topic: prediction-market-infra-general
date: 2026-06-04T17:38:00
---
#### Landscape as of Today:

* Wintermute announced on May 29 that it's now streaming two-sided quotes on event contracts across Polymarket & Kalshi, and notably quotes dynamically *between* the two venues to facilitate positioning without sharp price wings.
* Jump Trading, SIG, & Galaxy Digital are already active as market makers, and prime brokers Clear Street and Marex have built clearing on-ramps for hedge fund clients.

  * Clear Street became the first institutional FCM to join Kalshi's exchange and clearing house.
  * Galaxy launched an institutional OTC prediction market on June 2, clearing its first $10M order on Kalshi.
  * The ICE/Polymarket play is explicitly about data: ICE is the exclusive distributor of Polymarket's event data to institutional capital markets and launched a Signals and Sentiment tool for institutional clients back in February.
* At this point, my Daemon poller has ~500K rows straddling all of these entry dates.



#### Potential Future Directions:

1. **Institutional-entry event study** – Wintermute, Clear Street, Galaxy OTC are all dated treatments; my Daemon is the before/after panel for each. Outcomes that I've already computed: *cross-venue overlap frequency and size ($191-median surface); spreads; depths; LP markout*.

   * Falsifiable: does institutional MM entry compress the cross-venue dislocation, and does markout get *worse* for remaining passive makers (sniping intensifies as Budish predicts)? This converts both closed negative theses into the "before" arm of a diff-in-diff – the negative results become the baseline, which is the best possible result for them.
2. **Cross-venue coupling detection** – if one inventory (Wintermute) is quoting both books dynamically, the venues stop being independent. lead-lad should theoretically collapse toward the ~100ms floor and quote-update correlation should increase. I could use the detection-system built in EXP-4a.
3. **Arb migrates off-book** – my counterfactual 0.30% / 0.20% tier (not offered) is now arriving through a different door: FCM membership, block trades, Galacy's OTC desk.

   * Hypothesis: the 8/15 institutional-tier arb doesn't get competes away on-screen, it gets internalized off-screen. Detectable shadow: depth or inventory shifts in your book data without corresponding on-book prints. Hard, but even a clean negative ("no on-book footprint") supports the rent-privatization thesis.
4. **Accidental-FBA cross-sectional test** – I could formalize the FBA convergence thesis: if short-horizon binaries are accidental batch auctions, adverse selection per unit volume should *increase* with time-to-resolution. Group daemon markets by horizon, regress markout on horizon. This turns the essay's load-bearing claim into a falsifiable result.
5. **Consensus-quality / societal angle** – Wintermute's own framing is that tighter spreads should improve the quality of probability signals, making the venues resemble derivatives markets rather than side bets – and ICE is monetizing exactly that signal.

   * Methodology: Brier-score calibration of venue mids vs. outcomes, pre/post institutional entry, plus cross-venue disagreement as a consensus-quality metric. If calibration improves while rents concentration (per #1 and #3), that tension – better public signal & privatized extraction – is the question I'd like to explore this summer presented in a single chart, and it's a clean hook.

**Brief Definitions:**

* adverse-selection: people who choose to trade against your resting order systematically know something you don't. You end up filling when filling hurts your PnL. Uninformed flow trades against you randomly; informed flow trades against you selectively.
* markout: way to measure AS. take the full price, then look at the market price some fixed interval later (i.e. I prev. used 5-min intervals in my kalshi-polymarket analysis) and compute the PnL of the position over that window.

  * negative markout = price systematically moved against you after fills. you're being adversely selected
  * LP Markout = the post-fill PnL of your hypothetical resting quote
* sniping: a mechanism outlined in Budish et al. when public news moves the true value, a race starts between the MM trying to cancel/update its now-stale quote and fast traders trying to hit it first. the fast trader who wins "snipes" the stale quote. It's adverse selection delivered at latency speed; in continuous markets, whoever's microseconds faster will collect.
* rents: an economist's term for profits earned from a structural position rather than from creating value. The latency rent: profits that exist only because you're faster, or fee-tiered cheaper, than other

  * Budish et al. argue that continuous-market mechanism creates these rents, and the arms race to capture them is socially wastefull. My fee-cliff result is a rent gated by access, not trading skill.
* FCM (Futures Commission Merchant): the CFTC-regulated intermediary category, essentially a "broker for derivatives": holds customer funds, guarantees trades to the clearinghouse, nets margin.

  * FCM Membership (at Kalshi for example) means a firm like Clear street can now clear trades on behalf of clients (hedge funds), instead of every participant needing a direct retail-style account. It's the mechanism that lets institutional size flow participate.
* Block Trades: large trades negotiated privately between two parties, then reported to the exchange and cleared there, bypassing the public orderbook altogether. exists because dumping institutional size into a thin book would move the price against you.
* OTC (over the counter): trades arranged directly between counterparties off any exchange entirely. An OTC desk (like Galaxy Digital's) is a firm that stands ready to be your counterparty for size. You call them, they quote you a price, the trade happens bilaterally. Block trades clear on-exchange; pure OTC may not touch it at all.
* ICE (Intercontinental Exchange): the exchange operator that owns the NYSE, among many other clearinghouses & exchange; its biggest profit engine is actually selling market data. which is why its Polymarket investment being structured around exclusive data distribution rather than trading is the tell: it values prediction markets as a signal product.

To sum, spread is what MMs earn, adverse selection / sniping is what they lose, markout measures the losing amount, rents are who structurally captures the difference, and FCM/Block Trades/OTC are the new institutional doors through which that capture may be gradually moving off my instrument's radar.





#### Thoughts:
