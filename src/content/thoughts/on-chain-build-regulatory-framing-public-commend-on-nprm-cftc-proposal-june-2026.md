---
title: "on-chain build: regulatory framing & public commend on NPRM (CFTC
  Proposal June 2026)"
topic: VSA Markets
date: 2026-07-06T14:42:00
---
CFTC – June 10, 2026 Notice of Proposed Rulemaking ("Prediction Markets; Public Interest Determinations," RIN 3038-AF65), the most comprehensive federal framework for prediction markets.

**3-Step Test:**

1. whether it's an event contract in an excluded commodity
2. whether it "involves" an enumerated activity (unlawful activity, terrorism, assassination, war, gaming)
3. whether it's contrary to the public interest



Perps are on-shore.

CME / CFTC lawsuit on perps as futures rather than swaps.



Polymarket runs an on-chain DeFi international platform and a separate CFTC-regulated U.S. exchange, having acquired QCEX  – a CFTC licensed derivatives exchange and clearinghouse (for $112M to secure the regulatory infrastructure for intermediated US access.

**Stance on MNPI:**

* 2026 is extremely focused on insider trading / MNPI on prediction markets, and *pharma is named the single most exposed sector*.

  * Debevoise – flags that pharmaceutical, technology, and digital-asset sectors are particulary exposed because their most sensitive information concerns discrete milestones – trial results, FDA decisions, product launches – that become event-contract subjects, and an insider may not only possess nonpublic information but can be positioned to affect the event itself.
  * Freshfields – if no single input is clearly MNPI, but the combination of partial signals produces a highly accurate prediction, where does liability begin?
* VSA's security model relies on recruiting informed flow – the "informed share X" that secures the anchor against leveraged products – and the regulator is mid-decision on informed flow that looks like MNPI, in exactly pharma/biotech.



#### **Decisions:**

1. Which jurisdictional lane does this fall into (#3). There are three, and pre-raise I'm definitely in the third, but good to understand the road to #1.

   * Onshore/regulated (Kalshi / Polymarket-US DCM or intermediated model)

     * highest legitimacy, requires becoming or partnering with a licensed DCM/Clearinghouse, real capital, probably a later-stage goal.
   * Offshore/permissionless DeFi (Polymarket's international model) – matches my existing Base architecture, lower barrier, but carries the enforcement / MNPI / state risk and closes US-institutional access.
   * Research/design-partner/sandbox – testnet or tightly-permissioned accredited participants while the law settles. This is where the model currently sits. NEED A CREDIBLE PLAN TO A.
2. MNPI + Settlement-Integrity Answer: These are the two public-interest factors the June rule weights most heavily for a market like VSA, and they're where biotech is uniquely exposed.

   * What's the objective, manipulation-resistant resolution source for a clinical readout or PDUFA outcome (settlement integrity), and how do you distinguish permitted informed participation (a specialist trader expressing a research-driven view) from prohibited misappropriated trial data (an insider or someone who can influence the outcome).
   * This is where on-chain transparency / verifiable-neutrality is necessary.

     * Polymarket relied on this by deploying an on-chain surveillance solution with Chainalysis because every trade, position, and settlement is recorded on a public blockchain.
     * My Polymarket toxic-flow monitor is a prototype of the surveillance capacity this requires – core asset to cite.



**Note that biotech catalyst contracts are *not* an enumerated prohibited activity, and they pass the public-interest utility bar better than sports or culture because the rule explicitly credits contracts that let businesses mitigate risk more effectively than the imprecise hedges offered by other instruments.**

i.e., a clean catalyst volatility instruments vs. traditional equity options that bundle the readout with the whole company's macro / other intrinsic factors





#### **Public Comment:** Prediction Markets; Public Interest Determinations

The rule is "Prediction Markets; Public Interest Determinations," RUN 3038-AF65 (91 FR 35806), a 66-page proposed rule, and the deadline for commens in writing is July 27, 2026.

Submit via Regulations.gov at regulations.gov/commentation/CFTC-2026-1189-0001 under Docket ID CFTC-2026-1189. The form allows you to type inline or attach a file (which is what I'll do).



**Approach:** respond to the rule's own framework; not offering general support.

* Proposed Appndx F sets 3 public interest factors the Commission will apply to *every* contract –

  * price discovery and information-aggregation utility
  * potential threats to market integrity
  * compliance and self-regulatory challenges from the market's capacity to administer the contracts
* Identify myself as building a biotech-catalyst prediction market and intending to pursue CFTC registration. That makes me a *prospective registrant*, not a spectator.
* Factor A – affirmative case.

  * Biotech Catalyst hedging is the archetypal price-discovery/information-aggregation contractL clean catalyst volatility vs. equity options that bundle the readout with macro + company-wide factors.
* Factor B – engage the hard one honestly and constructively.

  * Propose adoptable factor language for how the Commission should evaluate MNPI/market-integrity risk in catalyst markets:

    * on-chain position transparency
    * participant-eligibility gating
    * prohibited-insider rules
* Factor C – settlement integrity.

  * Propose objective resolution standards (FDA action, company 8-K, other public sources) as the model of the "clear resolution criteria" the rule wants
* Close

  * Mirror the Commission's own stated goals back – responsible innovation, keeping trading onshore, price discovery – and a specific ask (e.g., that the final factors explicitly recognize objectively-resolved corporate/regulatory-milestone contracts as serving the public interest).
