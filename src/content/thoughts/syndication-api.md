---
title: '"Syndication API"'
topic: Martingale
date: 2026-09-29T15:46:00
---
*The Syndication API is meant to be an executable form of our options-implied analyses.*

The core object of the Syndication API is the **mandate schema**.

* A mandate is a follower's set of instruction, including the following:

  * Which events are admissible;
  * What price bounds and adequacy ratios imply a fill;
  * What concentration and capacity caps bind;
  * What happens when no quote exists.
* The **Follow-Engine** is the evaluator:

  * f (risk sheet , lead quote, book state) --> line size or decline;
  * each decision resolves to mandate\_id \_ revision + schema_version.



Around these two features, the API is essentially a systematized version of the deal workflow, including term-sheet intake & anonymization, panel solicitation and bilateral quote return, lead anchor, follower subscription against standing mandates, fill priority and capacity allocation under disclosed rules, confirmation generation, collateral instruction to escrow, and the decision/audit path.



The API itself contributes to 3 Phases of use:

1. Run this protocol as an internal routing tool where a human confirms ech step;
2. Expose the mandate as a config surface LPs can set with human confirmation on fills;
3. Operate the protocol as a registered facility under a rulebook.



It's essentially a **prerequisite to the marketplace Martingale is building towards**. 

Mechanically: the marketplace is nothing but a multi-party surface over the "API". Subscription mechanics (followers bind at lead's price, disclosed fill priority) are already an SEF design requirement; if the mandate evaluation, allocation, and confirmation layers exist and are tested, the marketplace is a persmissioned and interface problem, not an entirely new system.

Institutionally: what we take to an event-vol desk or a royalty fund isn't going to be a UI. 







**End Goal:** Martingale is building an algorithmic follow-syndication marketplace for bespoke biotech catalyst event swaps. It's essentially the Ki/Lloyd's digital-follow model, adapted from insurance to fully collateralized n-of-1 event contracts.

Group 1: ORIGINATION. Hedger's first question is capacity, not price, so exposure
