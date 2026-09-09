---
title: Swaps / Derivatives / ISDA – 2170
topic: Martingale
date: 2026-09-08T00:00:00
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

\------------------------------------------------

`/btw explain the importance of credit exposure in uncleared bilateral contracts based on post-2009 policy pushed STANDARDIZED event contracts into CCPs`

*Pittsburgh g20 commitment had 4 components:*

1. *standardized OTC derivatives onto exchanges or electronic platforms;*
2. *cleared through CCPs;*
3. *reported to trade repositories; and*
4. **\*non-centrally-cleared contracts subject to higher capital requirements** ... this became Dodd-Frank Title VII*

These are all necessary because credit exposure accrues over the life of the contract. In bilateral uncleared swaps, each party holds a direct claim on the other than changes in value continuously: `current exposure + potential future exposures`. 

CCPs can only run margin models on contracts they can value continuously and liquidate into a market on default. **Fungibility is required.** Any margin model on a binary event contract with fixed resolution would converge on maximum loss – which is how much full-collateralization posts to cover at initiation.

Full Collateralization = no VM / IM / defaul-fund / CVA to exchange; thus no FCM necessary, since FCM guarantees margined customer positions to a clearing organization and finance them through the margin cycle. If there's no ongoing credit exposure, this is not necessary.

\--------------------------------------------------

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

## Lloyd's / BWIC / Digital Lead-Follow / SEF

[https://www.google.com/search?q=does+the+U.S.%2C+have+a+bespoke+business+insurance+undewriting+markets+similar+in+structure+to+Lloyd%27s+of+London&rlz=1C1GCEA_enUS1231US1231&gs\_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCTIwODMxajBqN6gCALACAA&sourceid=chrome&ie=UTF-8&udm=50&fbs=ABfTbFVyMZGZf1hfvX9uKjN\_-G8cY2oODYyTyZk24Xz37_7FQ8RRzo6J-BIhE0fun05Kv9Vn_fvrMD9FN432YiYJstn5e8of0X9T45-pSpOFWHIkATpQhW_yceWBA8fYTgPgPdOrETKDD-Z38qezyO0BAorFy7aVzU4lIL4CE8BWijUs2uaUkTpwuSiC6CIz2_4qfjMuOxKv614pnSv_zSJH1z37W44Yng&aep=10&ntc=1&sxsrf=APpeQntaFQ89F1dfbw3tIQ3YDVuTvtGV7g%3A1788812389836&mstk=AUtExfAFXO8BPuzbWwMH8w0fw1Pob4Z15eMS1-F2hvhoTDXUOXWH0_UaXffC_fHGHs-xt3ohVzcyiUn3I6pzcXoaLBCjBfnxhPIP4JzEuxgOwFMFXL_a8hDjlHXHNf8NPn0d7rVam5JVJYrZwjYw7367m28eP5dgqrGL_zU&aioh=3&csuir=1&cs=0&atvm=2&mtid=tByfaqKLONur5NoPg8vNyQU](https://www.google.com/search?q=does+the+U.S.%2C+have+a+bespoke+business+insurance+undewriting+markets+similar+in+structure+to+Lloyd%27s+of+London&rlz=1C1GCEA_enUS1231US1231&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCTIwODMxajBqN6gCALACAA&sourceid=chrome&ie=UTF-8&udm=50&fbs=ABfTbFVyMZGZf1hfvX9uKjN_-G8cY2oODYyTyZk24Xz37_7FQ8RRzo6J-BIhE0fun05Kv9Vn_fvrMD9FN432YiYJstn5e8of0X9T45-pSpOFWHIkATpQhW_yceWBA8fYTgPgPdOrETKDD-Z38qezyO0BAorFy7aVzU4lIL4CE8BWijUs2uaUkTpwuSiC6CIz2_4qfjMuOxKv614pnSv_zSJH1z37W44Yng&aep=10&ntc=1&sxsrf=APpeQntaFQ89F1dfbw3tIQ3YDVuTvtGV7g%3A1788812389836&mstk=AUtExfAFXO8BPuzbWwMH8w0fw1Pob4Z15eMS1-F2hvhoTDXUOXWH0_UaXffC_fHGHs-xt3ohVzcyiUn3I6pzcXoaLBCjBfnxhPIP4JzEuxgOwFMFXL_a8hDjlHXHNf8NPn0d7rVam5JVJYrZwjYw7367m28eP5dgqrGL_zU&aioh=3&csuir=1&cs=0&atvm=2&mtid=tByfaqKLONur5NoPg8vNyQU)

The U.S., does not have a domestic insurance marketplace structured like a central, subscription-style exchange with competing syndicates under one roof the way Lloyd's of London operates. Instead, bespoke, unusual, and high-risk commercial business in the U.S. is handled through the **Excess and Surplus (E&S) Lines market.**

In the institutional bond and structured financial markets, **there is no centralized, physical marketplace structured like Lloyd's of London for custom hedging.** Instead, institutional investors looking to hedge complex asset-backed securities (ABS) or mortgage-backed securities (MBS) rely on a decentralized, electronic BWIC protocol.

BWIC operates as a decentralized, OTC electronic auction, whereas Lloyd's operates as a centralized, subscription-style exchange. In BWIC, risk is placed with *winner-takes-all* (the highest bidding dealer wins the entire bond / tranche block); Lloyd's uses a subscription model where syndicates cooperates to co-sign fractions of a single massive risk.

When an institutional participants holds an exotic or illiquid pool or mortgage or asset-backed paper and needs to hedge or liquidate it, they don't find an 'underwriter'. Instead, they operate the following protocol:

1. Initiation: investor sends a BWIC list (spreadsheet of specific bond CUSIPs, sizes, and maturities) to one or more major wholesale broker-dealers.
2. The 'in-competition' Phase: broker blasts this list out to the wider market of institutional market-makers, hedge funds, and alternative asset managers.
3. Bidding Window: market participants are given a hard deadline (often just a few hours) to submit blind, competitive bids for the specific risk tranches.
4. Execution & Risk Transfer: the seller reviews the bids. If a bid meets their internal reserve price (known as the C*over*), the bond is sold to the highest bidder.

*Does a BWIC exchange exist for tail-event risks based on smart-contract, uncleared, event contracts?*

**No, a BWIC exchange using smart-contract-based, uncleared event contracts to trade tail risk does not exist as a legally recognized Swap Execution Facility (SEF).**

Regulatory Considerations: *Event Contracts are swaps under Title VII of Dodd-Frank, meaning any platform operating multi-to-multi trading facilities for them must register with the CFTC as either a DCM or a SEF/*

The CFTC also regulates the *types* of event contracts that can be listed.

SEFs are permitted to list certain types of bespoke swaps that do not require mandatory central clearing – classified as **Permitted Transactions**. But, there are more regulatory considerations if they are executed via decentralized smart contracts:

1. Clearing Mandate: Legally, a SEF must ensure its participants are Eligible Contract Participants (ECPs) – meaning institution or high-net-worth entities. If a tail-event swap is uncleared, the counterparty credit risk remains completely bilateral. In traditional markets, this is backed by strict ISDA CSAs. A standard smart contract that locks up collateral on-chain as a proxy for margin does not fit neatly into the CFTC's legal definitions of compliant bilateral margin frameworks.

   * *Correction:* ECP-only isn't a SEF-specific requirement; it's the CEA's baseline for all off-exchange swaps: no-ECPs simply can't trade swaps except on a DCM.
   * *Correction:* The 'smart-contract doesn't fit margin frameworks' point doesn't apply to Martingale – The CFTC's uncleared-margin rules bind swap dealers and major swap participants. Between two non-dealer ECPs (all of our trades), collateral terms are purely contractual, so on-chain full collateralization isn't a nonconforming margin system.
   * Of course, fully decentralized, **permissionless / anonymous** smart-contract systems can't register as SEFs because SEFs must surveil, enforce limits, and know identities. Our system is permissioned and identified (KYC'd ECPs, screened participantion, measured informed share).
   * SEF execution mandates (order book, RFQ-to-3) apply only to Required Transactions, the cleared, made-available-to-trade lasses.

     * **Permitted Transactions**, which uncleared bespoke event swaps would fall under, may be executed through any means of interstate commerce: voice, RFQ-to-one, auction (multi-party bids / lines), standing mandates. 
     * So, a future registered SEF for our n-of-1 products wouldn't be forced into central clearing; it could legally run exactly the BWIC-auction and digital-follow processes we've read on.
     * Registration would buy us the right to operate them as a standing multi-party system.
     * Given that Kalshi was able to list PDUFA contracts on a DCM, we should be able to clear the CEA's event-contract review provisions.

**\*We'll run pilot as brokered bilateral trades under the IB wrapper; automation of follows phased behind further legal counsel** (need to understand where brokered-with-mandates ends and facility begins; and when standing multi-party execution can be executed.*

**Today, nobody operates a governed BWIC-subscription hybrid for event risk because the crypto-native protocols fail the identity requirements and the regulated venues don't have the pricing / escrow system.**

## Trader CitSec – Smid-Cap Biotech – Input

*Regarding incentive structure for a DMM as LP. In theory, if we claim to cater to bespoke tail-risk (i.e., making numerous markets within a single clinical trial on the terms requested by an institutional hedging party), then our designated MM would be holding counterpositions (even at any realistic premium – since there's no "spread" to be quoted in a bilateral contract) on niche risks that well-researched funds are paying a premium to offload.*

* Diversification identify handles variance, since per-market risk falls toward correlation floor as the book expands. But it does not affect the mean.

  * *Adverse-Selection is a mean effect:* per-trade expected loss to better-informed counterparties. If every contract was priced as a systematic informational disadvantage, diversification doesn't matter.
* The **n-of-1** nature of our contracts increases bias more than in listed markets: when the hedger writes the terms (trial, endpoint, window, size), the contract is a channel for private information.

  * The act of requesting a contract is informative

**Solution Space:** multi-dealer quoting

1. Aggregates independent models;
2. Gives hedger execution quality – attracts flow when there's no quoted spread to compress;
3. Distributes the informed-flow tax, instead of concentrating on a single sheet.

**Current Instances of Multi-Dealer Quoting in Asset Classes**

*Doesn't exist in listed derivatives, but is the primary architecture wherever bespoke tail risk clears.*

* **Lloyd's of London**: broker brings a bespoke tail risk to a lead underwriter who prices it, does the diligence, and takes the largest line; then, following syndicates subscribe capacity at the lead's price. The lead is compensated for pricing the risk that syndicates free-ride on.

  * Single DMM acts as lead: does the full diligence, sets the price, takes the anchor line (i.e., 40%), and is paid for leading (pricing fee out of arrangement, or better share of the premium).
  * Following syndicates take passive slices at the lead's price, as separate bilateral confirmations.
  * **Ki Algo:** *<https://www.instech.co/wp-content/uploads/2021/09/frictionless-data-maximising-benefits-ki-algorithmic-syndicates.pdf>*
* **BWICs in structured credit:** broker circulates a bespoke position to a dealer list, bids come back in competition, best bid wins.

  * Bids Wanted in Competition Data – affects how fixed income traders price and source illiquid securities, mostly for CLO, ABS, and MBS.
  * In this case, we'd onboard a panel of DMMs (3-6: event-vol desk, multi-strat, ILS-adjacent fund). Each origination goes out as a brokered solicitation (voice / email; parameters / terms; reference-stack with q, p, and wedge attached), quotes return, best price win the trade, papered as one bilateral confirmation.
* **Facultative reinsurance placement:** broker shops one bespoke risk to several reinsurers.
* **Syndicated lending's club deals** for loans.
* **Post-Dodd-Frank swap RFQ** (request quotes from minimum three dealers)

**Quote Path:** *A --> B; run the quote competitions early while the panel is small and each trade is important; as notionals grow, the winning quoter naturally becomes a lead and the losing quoters become natural followers since they've already priced the risk approximately.*

**Constraints:**

1. SEF: we've moved away from many-to-many pricing, and a standard electronic screen where multiple MMs post competing quotes that multiple hedgers can take is closer to a swap execution facility.

   * SEF is a full CFTC registration category with nuances, compliance staff, surveillance, and capital requirements much greater than IB path.
2. Privacy: anti-Cantor thesis is that proposing a market on your own catalyst broadcasts your hedge to other parties in the market.

   * *Mitigations:*

     * small rotating panels under NDA-grade protocols;
     * anonymized solicitations where the panel sees risk parameters (event, direction, size band, terms) but no the client's name till quote is accepted;
     * lead-follow, where only the lead sees full details and follow-ons see lead's price + parameters
3. Competition doesn't remove the need for the contract-design defenses, 

#### Hedging counterparties bring exposures to Martingale. We package it as an anonymized risk sheets (event, direction, size band, identifiers) + the reference dossier (options-implied q, panel base rate, wedge), and broker them to a small onboarded panel of DMMs, yielding quotes returned in competition, BWIC-style, with the best price winning the trade as a single bilateral ISDA confirmation.

#### As notionals grow, this matures into Lloyd's syndicate structure: one specialist warehouse acts as lead, does the diligence, sets the price, and takes the largest line on on the opposite side of the market, compensated for their pricing confidence. Follow-on syndicate members take passive slives at the lead's price, each papered as its own bilateral confirmation (as per ISDA).

#### Martingale remains the fee-only broker: running solicitation, supplying the reference pricing, and papering the trades.

## \-------------------------------

*Regarding opportunity cost / cost efficiency of pricing such niche events & generalizability across other products our DMMs are already providing two-sided quotes on.*

Of course, a MM earns edge per unit of pricing effort.

Should focus on the following as LPs:

* Event-vol desks where pricing work is already a sunk cost: SIG-type biotech options desk that prices FDA jumps to order to quote straddles through catalysts.
* Fundamental biotech specialists: funds and pods.
* Per-risk underwriting capital: similar to ILS and specialty-insurance, where the trader's framing dissolves entirely: pricing one niche risk at a time with bespoke diligence isn't their opportunity cost, it's their core business model.

##### **\-----------------------------------------------**

Public Changes:

`/docs/deal-flow` revisions:

§III Negotiation \[rewritten]

* Once the exposure is defined, we package it as a risk sheet and the reference dossier described above, and we solicit quotes from a small panel of professional warehouses onboarded in advance.
* Every execution is a separately negotiated bilateral confirmation between the hedger and one warehouse, written on that pair's own ISDA docs. Brokered solicitation with bilateral execution is what keeps us out of SEF territory, which attached to many-to-many systems where multiple participants execute against multiple participants.
* One smaller notionals, the best quote wins and the trade is written against that warehouse alone. Larger notionals syndicate lead-follow: one specialist DMM leads pricing via full diligence on the event, pricing, anchor line on the contract, and compensation for leading. The remaining panel members take passive lines at the lead's price, each on its own bilateral confirmation with the hedger, resulting in several swaps at a common price rather than a single syndicated position. No two DMMs will participant in any single contract together.
* The hedging party's identity and the underlying exposure are disclosed to prospective leads under confidentiality protocols agreed in advance.
