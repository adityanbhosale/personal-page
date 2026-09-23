---
title: Lloyd's Algo Syndication Sim
topic: Martingale
date: 2026-09-21T14:26:00
---
##### Background:

Given that A/S risk is significantly higher in the OTC market, compared to public, standardized exchanges, MMs/LPs employ the following defenses when a corporate client approaches a broker to buy an event swap:

* Aggressive premiums
* Dynamic delta hedging

  * If a bank underwrites a macro event swap tied to an inflation print or interest rate decision, they immediately hedge that exposure using highly liquid, correlated public markets
* KYC / MNPI clauses
* ISDA Procedure & Margin Model

  * transactions are governed by standard International Swaps and Derivatives Association (ISDA) frameworks. dealers require participants to post substantial initial and variation margin (collateral).
  * this ensures that even if the bank faces adverse selection, the counterparty risk is minimized because the cash to cover potential losses is already secured in escrow

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

1. A – historical book.
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

## Context:

Working on `martingale-pricing` ; create branch 'follow-engine kickoff' from main. This session is meant to add the **follow-engine** simulation program to the repo under a dedicated 'follow/' subtree: essentially a *ki style digital-follow syndication algorithm as follows*

`f(risk sheet, lead quote, book state) --> line size or decline`

applied to bespoke biotech catalyst event swaps.

## Thesis:

*Ki proved that follower capacity becomes software once appetite is a data structure; Martingale is writing that data structure for event risk, and validating it against 10+ years of adjudicated FDA outcomes.*

Let's define a *mandate* in the Ki model. When syndicates place capacity on Ki's platform, they don't review any risks; they simply hand the model a structured 'statement of appetite', including (1) which leads they'll follow, (2) which classes, (3) how much per risk, (4) how much in aggregate, (5) and what price conditions. 

The algorithm then executes that statement against live deal flow, and the underwriting director's job is to write and turn the statement. Ki sells that model which faithfully executes appetite statements at scale.

To replay a *simulated* mandate against 10+ years of synthetic deal flow, we need to represent the mandate as data (schema with fields for the leads whitelist, therapeutic-area filters, event-window rules, kill switch).

**Sim A** – sweeps values of those fields and returns what configurations would have been profitable.

**Sim B** – stress tests against informed flow.

**Sim C** – prices the lead's compensation for the ecosystems those mandates create.

**Sim D** – addresses the capital velocity of a book given the clustering of our calendar.

This data structure is *identical* to what a real follow-on syndicate would configure. The sim's input format, once validated, is the onboarding document an LP would fill out when it puts standing capacity on our platform.

##### SEF Consideration:

An SEF is essentially a system in which multiple participants' standing trading interest can execute against multiple participants' trading interest under the venue's rules.

The Ki transcription is meant to develop our facility's matching logic, its rulebook's economic content, and its capacity-allocation mechanics.
