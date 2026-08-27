---
title: 2170 Syllabus
topic: FNCE 2170
date: 2026-08-25T13:56:00
---
Text: John Hull, *Options, Futures, and Other Derivatives, 11th ed.*

Derivatives Examples:

1. Pershing Square / Valeant / Allergan
2. Lehman Principal-Protected Notes
3. broadcast.com / cuban / gs

Exchange traded derivatives usually delta-hedged, OTC have higher margins harder to fully hedge

**Types:**

1. Forwards & Futures

   * contracts binding both parties to exchange a specified q. of an underlying asset on a single future date for a price agreed today

     * Forwards are OTC traded while futures are exchange traded
2. options

   * contracts in which one party, against an upfront premium, acquires a right, but not the obligation to exchange a specified quantify of an underlying asset for a price agreed today, or, more generally, to exchange payments determined by an agreed rule

     * calls / puts are vanilla options, but there are other exotic options
3. swaps

   * contracts binding both parties to an exchange of payments determined by an agreed rul

     * distinction between forwards and swaps (both OTC-traded) is largely a matter of convention, with swap in practice services as the residual lable for OTC derivatives that are no styled as forwards, options, or combinations of these2

**Where Derivatives Trade:**

Derivatives are not embedded in other securities (as Lehman's PPNs were) can be traded on organized exchanges or OTC – i.e., through bilateral transactions, generally with a dealer acting as counterparty.

*OTC-traded derivatives (pre Dodd-Frank / EMIR reforms)*

* customizable
* access via dealer relationship
* wide bid-ask spread, opaque pricing
* uncleared: bilateral credit exposure, early unwind by renegotiation

*Exchange Traded Derivatives*

* standardized
* open access via broker
* tight bid-ask spread, transparent pricing
* centrally cleared: negligible credit exposure, early unwind by offsetting trade

**ISDA Framework**

OTC Derivatives are documented through a standard legal architecture published by ISDA

* Master Agreement: a standard-form umbrella contract, deliveraly left unedited, governing all trades between two counterparties – payment mechanics, events of default, early termination and close-out.
* Schedule and Credit Support Annex (CSA): negotiated part of the agreement – elections and amendments to the Master (Schedule) and collateral arrangement (CSA)
* Product Defintions
* Confirmation: short doc finalizing each trade's specific terms (notional, dates, underlying, rates)

This structure allows the counterparty relationship to be negotiated once with the Schedule and CSA; each new trade then requires only a confirmation – which is what makes OTC derivatives both despoke and tradable at scale.

Central Counterparty default waterfall:

1. defaulting memeber initial margin
2. defaulting member default fund contribution
3. CCP skin in the game
4. non-defaulting members default fund contribution

**G-20 OTC Reform**

**"**All standardized OTC derivative contracts should be traded on exchanges or electronic trading platforms, where apprioritate, adn cleared threough central counterparties by end-2012 at the latest. OTC derivatiec contracts should be reported to trade reposititoes. Non-centrally cleared contracts should be subject to higher capital requirements."

* reflecting the focus on systemic risk from large dealer exposures

#### Application:

"Central Clearing" = counterparty substitution. When a trade clears, the original bilateral contract is torn up through novation and replaced by two contracts: buyer vs. the clearinghouse  &&  clearinghouse vs. seller.

The CCP becomes the buyer to every seller and the seller to every buyer. This is necessary for **multilateral netting; initial and variation margins exist because the CCP must survive defaults from any party.**

Whether a trade is "centrally cleared" depends on if any entity interposes itself as counterparty to both sides. An 'internal clearinghouse' that novates trades is **central clearing**. Any entity doing that for swaps must be a registered DCM.

On the other hand, collateral sitting in escrow (a custodian, or smart contract) while the contract remains between the two original parties is NOT central clearing, no matter how automated the margin mechanics are, because no one was substituted in to take risk.

**Our products are swaps:** bespoke, cash-settled, event-referencing, & bilaterally negotiated. Although, they aren 't security-based swaps

*Issue:* uncleared bilateral contracts carry **credit exposure,** and post-2009 policy has pushed standardized contracts into CCPs. note – *standardized.* Bespoke n-of-1 event swaps between ECPs aren't a part of that mandate, so nothing is forcing them to be centrally cleared, and no FCM is required anywhere in our current architecture. The FCM is only required once customers access a clearinghouse through intermediaries; §2(e) bilateral swaps have no clearinghouse to access.

Plan is to run uncleared contracts now, and become a DCO later.

Martingale's moat is privatized short positions off the equity markets via n-of-1 bilaterally negotiated OTC contracts. Central clearing pulls in an opposite direction. CCPs work because contracts are retail-fungible.  

`Defintions:`

`Netting: collapsing offsetting positions into one number. Only identical contracts can offset.`

`Margin Model: the model a clearinghouse uses to set initial margin, the collateral that must cover potential losses on a position between a default and the CCP closing it out, usually sized to a worst-case move over a few days at high confidence. Estimating that worst-case move requires knowing how the contract's price behaves: its volatility, its jump risk, its correlation with other positions.`

`Any n-of-1 instrument (bespoke contract) has no price history, so there's nothing to estimate a distribution from, and a binary event contract's price doesn't diffuse anyway  it gaps. Which is why the fully collateralized model fits our contracts: when max-loss is posted upfront, no margin model is needed at all.`

So again, our moat is privatized short positions off the equity markets via n-of-1 bilaterally negotiated OTC contracts. Central clearing pulls in an opposite direction & CCPs require fungibility between contracts.

Netting requires offsetting *identical positions*, margin models require price history, and mutualized default funds require a membership trading the same products. A bespoke non-fungible contract defeats all three, which is why bespoke instruments are usually **uncleared.** 

RFQ ...

Wide-spreads, opaque-pricing ... therefore accept LP's internal mark for quote

**Martingale RFQ Flow:** hedger specifies the contract (event terms, size, payout), Martingale routes that ticket to the warehouse, the warehouse returns a quote (ideally expressed as a spread to the published anchor so the hedger can see what's reference and what's charge) and acceptance of quote *forms* the trade.

**Martingale Clearing Flow:** acceptance creates an uncleared bilateral swap. No novation, no CCP, both sides post max loss into escrow at trade formation time, and settlement pays out on event resolution.

*RFQ for price formation, full collateralization instead of clearing (for credit risk).*



*smart contract escrows solve the interposition feature typically solved by CCPs with default funds and margin mandates*, since ordinary derivatives have open-ended losses.

A binary's worst case is bounded at inception, so full collateralization is feasible. Both parties posting escrow into smart contracts that are immovable eliminates credit risk: there is no future obligation beyond what's already posted so there's nothing to default on. Settlement finality comes from the settlement identity.



*we don't novate as in a CCP.*  our contracts don't become buyer to every seller; counterparties face each other or hold tokens against escrow they funded themselves. no default fund. the L2 underwriting fund (F) is not a default fund. F is the warehouse's own capital against a compensated residual position. 

CCPs are essentially TradFi's mechanism for manufacturing capital efficiency through margin and mutualization. Note, settlement leverage can't be manufactured, only underwritten. F underwrites it.

*Our underwriting fund F serves the same function as a CCP without a clearinghouse.*

Full collateralization alone does not exempt us from clearing regulation. LedgerX cleared fully collateralized contracts and was still a registered DCO, because it interposed itself between parties. The CFTC's position is that clearing is clearing regardless of technology, and a smart-contract system that novates would attract DCO scrutiny no matter how decentralized the mechanism is. The load-bearing question is not whether it's on-chian or if it's fully-collateralized, but that there's never any interposition or novation – *the on-chain escrow is a settlement utility both parties use, like a very good custodian-and-calculator, not an entity that becomes anyone's counterparty.*

**This gives on-chain clearing 3 successive jobs:** 

1. During the pilot, it's optional infrastructure under bilateral trades – escrow as the credit-risk backstop for parties that prefer it, with ISDA paper doing the legal work.
2. During the venue phase, it's the standard settlement rail that every listed market clears through, still no novation.
3. And at Category 1, it flips from a regulatory question into the product – a registered DCM/DCO doesn't obsolete our clearing layer, it licenses it, because a fully-collateralized, identity-settled, oracle-resolved clearing stack is what a traditional venue can't easily build.

*Clearing technology vendor to a regulated clearinghouse.*



Full 'clearing' flow via Martingale Systems:

Martingale arranges the trade, hedger and warehouse negotiate price bilaterally (i.e., direct RFQ). An ISDA Master and Schedule is negotiated once per counterparty paid, CSA governs collateral, and a single confirmation per trade. Counterparty credit risk, which is the main goal of central clearing, is eliminated at inception since the binary's bounded payout makes full collateralization feasible. Each side posts its maximum obligation into escrow smart-contracts, which neither party nor Martingale can unlaterally move. This means no margin model or default fund is necessary; no variation margin cycle, daily credit exposure, or anything for an FCM to guarantee exists.

Regarding settlement: the oracle writes the outcome, payouts redeem atomically against it, and our internal guardrails (settlement identity, unresolved-market gates) make premature settlement impossible.

Trades are reported to a swap data repository.



*In summary, 'clearing' requires novation & DCO classification. Martingale facilitates fully collateralized bilateral settlement. Nothing needs to be 'cleared' because full collateral is posted in escrow smart-contracts, removing credit risk, necessity of a CCP, FCM, or margin model.*





## *Reg. Path*

NFA-registered Introducing Broker under the CFTC for custom bilateral structures under ISDA.



Here's what registration involves: filed with CFTC through the NFA

* Form 7-R for the firm
* Form 8-R with fingerprints for me as principal and associated person, a proficiency requirement (Series 3 for futures-side activity; the NFA's Swaps Proficiency Requirements for swap-side)
* For an independent IB – a minimum adjusted net capital requirement on the order of ~$45k, since the guaranteed-IB route requires an FCM guarantor we're deliberately bypassing.
* Some annual NFA dues, every few weeks



Note we require no FCM since we don't custody any funds, no swap dealer since we take no positions and a warehouse doing a handful of contracts sits under the de minimis threshold), no DCO (nothing novates), no SEF (this means RFQ must remain brokered and bilateral, i.e., no screens where multiple partipants execute against multiple MMs quotes).



**Process:**

1. Go to a CFTC/derivatives regulatory counsel

   * need a registration & perimeter memo: does the pilot's arranging activity require IB registration
2. Get confirmation that the fee-only fund-flow is clear of FCM and money-transmission analysis
3. Understand who bears the SDR reporting obligation on our trades
4. SEF perimeter for our RFQ design
5. SBS boundary for the instrument as drafted



**Firms:**

* Katten, Willkie, Steptoe, Covington, K&L Gates, and Sidley
* Or a boutique
* Or a former CFTC staffer in solo or small practice, scoped that one pilot memo at a fixed fee
