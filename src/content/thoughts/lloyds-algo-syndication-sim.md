---
title: Lloyd's Algo Syndication Sim
topic: Martingale
date: 2026-09-20T23:11:00
---
Digital-follow algo requires structured slip data (class, lead identity, terms, lead's price, line structure), scores the risk against a pre-set model, returns a line size or decline.



Appetite:

1. price-adequacy – is the lead's premium sufficient against a benchmark

   * modeled against internal loss history & market-rate movements
   * our followers would benchmark against options-implied q per event & panel's base rates
2. portfolio-construction – concentration, accumulation, class weights against the current book
3. lead-quality prior – nominated-lead whitelist + calibration of each lead's pricing over time
4. constraints – caps, classes, default case
5. proprietary inputs – coefficients



Deviations:

* We don't require a tail-risk model since all positions are fully collateralized, meaning the follower has to choose lines which maximize expected premium net of expected loss subject to total collateral ≤ K, and the concentration caps.
* Weaknesses:

  * No loss history for n-of-1 contracts
  * no lead reputation
  * sub-outcome legs hav e no adjudicated history



Simulations:

1. A – historical book – 
2. B – adverse-selection risk; reuses crossing-sim's repo.

   * introduce correlation between which contracts get requested + outcomes
   * sweep informed share X
   * measure:

     * loading required for the mandate to break even as a function of X
     * how much each contract-design defense (exposure caps, retained first loss, per-hedger limits) attenuates the bias
3. C – lead-follower sim – agent-based; addresses lead compensation

   * populate with leads of heterogeneous pricing skill, followers running mandates, auction phase with winner's-curse shading, and reputation updating over repeated events
   * equilibrium question is what lead fee makes doing the diligence and anchoring the line incentive-compatible against the alternative (free-riding as a follow-on).
   * Ki pays for followability implicitly through Lloyd's brokerage conventions

     * we need to size it explicitly
4. D – capacity & clustering

   * PDUFA calendar bunches up, full collateral locks capital from signing to resolution, so a $K book has a measurable throughput and a capitcal-velocity cost
