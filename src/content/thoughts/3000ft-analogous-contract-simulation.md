---
title: 3000ft ; analogous contract simulation
topic: Martingale
date: 2026-07-25T17:07:00
---
**Asset:** p is a bounded martingale on \[0,1] with a single scheduled jump at a known date.

* zero drift; no carry view, only revision view



**Trader's Coordinates:** probability; conditional magnitude; timing. The instrument set maps onto each one-on-one.

* Anchor is the 'level' view: own p against the mechanism, return multiple 1/p, direction and conviction.
* Dated Future is the same view with capital efficiency – it's linear in p and near-redundant with spot, which is why leverage on it has to be underwritten rather than manufactured (conservation identity: symmetric leverage in a zero sum binary book cancels at settlement; someone needs to over-collateralize for a winner to receive more than the loser posted).
* Straddle is the magnitude view – convexity in the size of the move, this is the one exposure desks can't express today.

## Sim Summary:

*Can a market maker survive quoting one of these event markets?*

Take one real event – we picked CMS Medicare Advantage rate announcement, the closest real-world analog to a biotech catalyst – and build a simulated market around it. One side is hedgers (insurers who'd pay to offload rate-surprise risk), the other is informed traders, and in the middle sits a warehouse quoting prices and holding the risk. The sim runs a ledger for that warehouse: spread income – A/S loss, a charge for holding inventory through the announcement, a capital charge.

**Crossing = the warehouse ends up positive while actually filling hedger orders –** i.e., a viable market exists. Since we don't know the true value of things like hedger demand or informed share, we swept them: 8,424 combinations, and asked whether the warehouse clears in *any* of them.

## Sweep.py Audit:

The sweep varies the *inputs* exhaustively, but the *rules of the world* – how revenue is defined, how the warehouse's position is booked – were hand-written assumptions shared by all simulated cells. If one of those rules is wrong, every cell would inherit the error and unanimously failure tells us about a code issue, not a market issue.

**Audit Findings:**

1. Revenue – the sim only let the warehouse earn the mechanism's posted half-spread. A hedger might be willing to pay 500bps to offload risk; the sim paid the warehouse ~347 regardless. Real designated MMs negotiate their spread – that's the structure we'd already moved toward.
2. Position booking – the sim added hedger flow and informed flow into the warehouse's inventory on the same side. but the entire point of a 3-party market is that informed traders take the other side of the hedger – the warehouse holds only the residual. The sim instead charged informed lfow against the warehouse twice: once as a pick-ff losses and once as inventory it had to carry. structurally, it was simulating a two-party market with a parasite attached – that's fundamentally not what Martingale is engineering.

   * when fixing the position booking error, 0 --> 13 / 8,424 cells cross. Model both corrections and 46 cross.
   * "the market clears once at least 10% of informed flow offsets hedger flow. The market fails only under the assumption that the warehouse can't net flows – and a counterparty who deals with both sides can."
   * this is a measured argument that an anonymous anchor-warehouse can't work but a brokered designated MM can.
