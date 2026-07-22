---
title: feedback – castle
topic: Martingale
date: 2026-07-21T10:17:00
---
Price Discovery ≠ Liquidity

Businesses want markets to offload risk

MM's want +EV trades

\-----------

Martingale doesn't claim to pay MMs for their liquidity directly, it simply subsidizes the anchor price via LS_LMSR (with bounded maxLoss) for price discovery.

Warehouse's premium is paid by the **flow:** essentially the spread that takers cross and the funding the crowded size will pay each interval.

In Castle's case, the MM trades are +EV because the counterparty is a hedger – price-insensitive, offloading risk, systematically willing to pay above fair value for certainty, the way insurance buyers do.

Regarding Martingale's proposed flow, specialists with real edge show up to trade a, say, $600M-cap's Ph3 readout. This is the informed flow we want. The anchor needs informed flow (≥ the participation floor) for security / validity; the warehouse bleeds to informed flow (ADVERSE SELECTION, no hedging flow). If the book is warehouse-vs-informed-takers only, no premium will ever make the trade +EV for traders – too much adverse selection. 

So, who's the hedger in a Martingale-style market? Hedger flow is directional but *uninformed* (they're offloading embedded exposure, not expressing alpha), price-insensitive, and premium-paying. With hedgers in the book, the structure is more functional: hedgers pay for transfer, informed traders correct the price drift hedger pressure creates (which is +EV for them, which is what also attracts the informed flow the anchor requires), and the warehouse intermediates by providing liquidity and earns the transfer premium net of adverse selection.

**Hedger origination is upstream of MM sourcing.** Castle isn't claiming that OTC is better, they're claiming that if you source the paying side first, the MMs will come willingly because the flow is demonstrably +EV to trade against. They built corporate relationships (the hedgers, medium-sized businesses) and the MM connections came from past employers.

The warehousing framework still applies as the *description* of what the MM is economically doing – holding unhedgeable dated risk through resolution, **made viable by diversification across the book (**σ·√(ρ+(1−ρ)/N)**)**



So, changes:

1. Roadmap – designated-MM bilateral relationships move from "graduate to eventually" to being the primary liquidity plan.
2. Hedger origination is now a named business function – this is arguably the primary BD priority.

   * Who is the channel to biotech hedgers?

     * Royalty funds and licensors directly; credit desks; and S&T desks like Leerink's who already see this flow and can't serve it.
3. Pilot's *D* gets sharper – measure demand by *flow type* – hedger demand specifically – because hedgershare of flow is what determineds whether the warehousing LP gets +EV trade.
4. Reframed MM pitch: no longer asking them to "take warehousing risk for a premium" – offering first access to a new class of +EV hedger flow, with the risk math (diversification, invariant, proven maxLoss bounds) that make holding it through resolution tractable.

And, residuals:

* This reframe makes the cold-start a little harder – demand-led means we need hedger commitments (even soft-committed) before the MM conversations work out, and originating hedgers without live liquidity is probably quite hard.
* Castle approached this issue through founder relationships & bespoke deals; I could probably get a small number of hand-built first trades.
* **more OTC-ish for the first mile feeding into on-chain market structure**





**\-------------------------------------**

Wording Changes: /docs/thesis

In Section 1 (Market's Bundle; Beliefs Don't): "The most common trade in finance is a compromise. For instance, a trader finds a research edge and arrives at a precise belief about something – a ruling, a regulatory decision, a data release, a contractual milestone, etc. – and identifies a financial instrument to express that edge. Often, that instrument reprices more than their isolated belief – the company, sector, index, a volatility surface – forcing the desk to warehouse unwanted exposure.

Consider a fund that beliefs a merger closes but that the market's implied timeline is wrong. Or a credit desk holding a financing note whose value hinges on a milestone that has no market of its own, so the desk marks a bundle. Or even an energy trader, who may have a view on a single permitting regulatory decision, not on the broader forward curve it sits inside. In each case the underlying event is well-defined, resolvable, and heavily researched – and in each cast the closest financial instrument bundles it with beta, rates, idiosyncratic noise, and other factors that happen to resolve in the same expiry window. The premium paid or collected is mostly rent on exposure that nobody wanted, meaning one side of the trade warehouses tails it had no view on and its counterparty warehouses the inverse.

Prediction markets were meant to be a solution, and in some cases they delivered: they proved the demand for direct event exposure is enormous. But the volume of trades on PMs concentrated where natural uninformed hedging flow exists – elections, sports, culture, and a handful of macro headlines – and the long tail of events with real economic / societal consequence and narrow audiences remains unpriced. The easy explanation is that these markets are "too illiquid to exist."

That rationale is only partially sound. We're building the machinery that makes on-chain verifiable event contracts functional in tail markets."

In Section 2 (The misdiagnosis): "It's true that there's rarely a natural, continuous, two-sided market in bespoke event contracts. A binary outcome lacks organic counterparties; between events there's nothing to trade; at events the demand is episodic, concentrated, and research-driven. Traders waiting for a crowd to show up and stream quotes into a long-tail event market will likely wait indefinitely, and the venues that have tried the empty order books prove this.

Long-tail event markets fundamentally cannot look like the markets we have today. They need to be manufactured – a market in which the quote is produced by a mechanism rather than a counterparty, and size is provided by a professional warehouse that is paid to hold risk it cannot hedge."
