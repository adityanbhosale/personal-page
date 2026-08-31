---
title: RFQ / Deal-Flow.html
topic: Martingale – OTC Economics
date: 2026-08-30T17:45:00
---
Regulating Over-the-Counter Markets (Nov 2024, Journal of Finance) – Lee & Wang

https://finance.wharton.upenn.edu/~wangchj/papers/OTC_EX_IA.pdf

* **Question:** OTC markets dominate most asset classes despite exchanges existing, and dealers site high OTC market share and lower OTC trading costs as evidence no regulation is needed. *Do those metrics actually tell you anything about welfare, and when restricting OTC trading helps?*
* **Model:** Glosten-Milgrom setup with venue choice. Their definition of OTC is trading executed non-anonymously between client and dealer, including RFQ; dealer sees each trader's public label (likely informed, likely uninformed; although this is an imperfect label) and can price discriminate on it (*this cannot occur on exchange listed markets).*

  * In equilibrium – the dealer offers tighter spreads to likely-uninformed traders and cream-skims them off the exchange, so OTC spreads are narrower than exchange spreads, and hedgers sort OTC while informed-looking flow sorts to the exchange.

    * Assume a market has \~100 hedgers (uninformed, willing to pay spread) and \~20 informed specialists (going to inevitably cost the maker / dealer). Spread is the insurance premium against the informed – that's why informed:uninformed matters.
    * Exchanges are anonymous so it needs to quote to everyone the same spread. The OTC dealer sees each counterparty's label before quoting (not their true type, but their public signal; i.e., AIG vs. Two Sig; insurer or pod-shop; hedging vs. alpha).
    * *Sorting*: OTC dealer looks at a likely*\-uninformed* counterparty and reasons that "this pool is ~5% informed, so I can quote them a *tighter* spread, ~10bps, and still break even." He could also look at a likely-*informed* counterparty and quote the more defensive spread, ~40bps. Now every trader in the counterparty pool picks their best available price.

      * Hedgers will take the 10bps OTC quote, obviously, so they drain out of the exchange.
      * Informed traders wget no discount, so they're indifferent and end up on the exchange.
* **Mechanism: CHEAP SUBSTITUTION**

  * restricting the dealer's ability to discriminate (blurring labels, or closing OTC entirely) pulls the two spreads closer together. small-benefit hedgers exit the now wider OTC market while large-benefit hedgers enter the now-tighter exchange, so welfare can rise even as total volume falls and average spreads wider.

    * when we stop the OTC dealer from discriminating, the two spreads converge: OTC quotes get wider and exchange quotes get tighter (since informed traders no longer concentrate on exchanges, so the exchange pool improves with more hedgers present).
    * the hedgers who leave the exchange are the ones that were only barely willing to pay the old OTC spread, so each of 
  *
