---
title: options/perps for synthetic spots on private companies??
topic: VSA Markets
date: 2026-06-29T22:20:00
---
SolFi is a Prop AMM. A prop AMM is a professional market maker's quoting engine wearing an AMM costume. The on-chain contract is a near-hollow wrapper; the prices come from a private off-chain server running the firm's algo. Unlike Uniswap/Raydium/Orca, they don't like users pool liquidity – they run solely on capital provided by the AMM producer, and they only accept trades routed to them from aggregators like Jupiter. No frontend, no token, no community LPs. It's just on-chain infra operated by professional firms using their own capital and algos – closer to a TradFi prop desk.



## Synthetic Underlying for Private-Asset Catalysts...

Problem: single-asset private biotech has enormous value riding on a binary catalyst – a trial readout, an approval – an **no market prices it**. Public catalyst options exist but are expensive and indirect: a binary event creates a bimodal, un-hedgeable gap that options market-makers can only cover by loading huge premium into implied vol. And the cleaner instrument – a pre-IPO-style perps market, doesn't transfer, because a perp needs a *coming price* to anchor to (i.e., SpaceX upcoming trading on NAS), and a private single-asset biotech has no coming price. The readout produces a fact, not a price.

So, the instrument that would let a fund express a catalyst view (with leverage) on a private asset simply has nothing to settle against.



#### **Mechanism: Manufacturing the Anchor**

Instead of waiting for an external price to arrive, **build the anchor synthetically**, in two layers.

**Layer 1 – synthetic spot (analogous to VSA markets)**. A sponsor-subsidized liquidity-sensitive market maker (LS-LMSR, bounded worst-case loss) runs a market on the catalyst outcome. Its objective is the *inverse* of a normal market-maker's: rather than repelling informed flow as toxic, it's subsidized to harvest informed flow – because in a market with no external anchor, the informed cohort's A/S is the only price signal. The output is a continuous, live probability **p** that moves between  0 and 1 as informed flow arrives. That probability is the catalyst's "spot price."

Two validated properties make **p** usable as a reference: a small informed minority (~2-5% under clean conditions) is pivotal in moving it, and the sponsor *cannot* set it – with no informed flow to revert to maximum uncertainty (0.5), not to the sponsor's seed. The price is neutral by construction and the neutrality is verifiable on-chain.

**Layer 2 – derivatives on the probability.** Once **p** exists as a continuous, neutral underlying, you can write instruments on it:

* a perp on p, funding-anchored to the Layer 1 spot the way SPCX was funding-anchored to Nasdaq – except the anchor is now manufactured continuously;
* options on p – the right to buy the catalyst probability at a strike, letting a trader express a *vol* view on the catalyst (is the probability mispriced?) separately from a *directional* one (does the event happen?);
* leverage, so a fund can express a catalyst view on margin rather than fully funding a position in the binary.

The funding-rate tether means Layer 2 can't drift away from the harvested probability – the neutrality of Layer 1 propagates upward by construction.



#### **Open Problems**

1. The derivatives layer is a manipulation surface.

   * Leverage on p gives a holder a concentrated incentive to push the thinner Layer 1 spot to move their Layer 2 payoff (similar to an oracle/settlement-manipulation attack), which is quite harmful in thin markets. VSA's manipulation-resistance result (security via informed participation, not cost) is a potential defense, but it must be re-derived with the levered derivatives incentive added to the attacker's payoff. This is the single hardest open question.
2. Leverage into a binary gap is a liquidation problem.

   * A catalyst is a discontinuity; levered positioned can't be liquidated through a jump. The perp-on-p likely has to **halt and convert to binary settlement** as the catalyst date approaches, rather than pretending to be a continuously liquidatable instrument.
3. Regulatory.

   * leveraged exposure to a private company's clinical outcome raises securities questions and likely forces a permissioned/accredited participant set – which thins the market further.
