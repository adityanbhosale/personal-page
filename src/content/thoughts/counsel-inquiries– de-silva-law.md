---
title: Counsel Inquiries– De Silva Law
topic: Martingale
date: 2026-09-15T18:25:00
---
1. Contract terms.

   * A term sheet or sample contract;
   * The kinds of events we plan to cover (company specific readouts and FDA decisions, or broader);
   * How payments are determined and by whom; and
   * Typical notional size.
   * *The core product is a cash-settled binary contract on a named biotech regulatory or clinical event (FDA approval decisions; PDUFA actions; AdCom outcomes; and hard-dated clinical data readouts – all company specific). Each contract specifies the reference event, a resolution source committed at inception (likely from the FDA's published action or the sponsor's public disclosure), a settlement date, and a fixed payout per contract. Settlement is mechanically pre-determined; neither party exercises discretion, and an event which is unverifiable from the resolution source by the settlement deadline follows a specified fallback instead of settling. No contract references the sponsor's underlying equity price. A drafted term sheet is attached.*

     * Rough notional size?
     * Drafted term-sheet?
     * Move-size contract?
2. How a contract gets done, step-by-step.

   * Who sees a request;
   * How LPs repsond
   * Whether LPs can view competing quotes 
   * How the lead is chosen;
   * How follow-on parties are allocated positions;
   * Whether any of the above functions on a system participants log into or through our team directly.
   * *Origination and negotiation are brokered entirely by Martingale's internal team through direct outreach, email, and calls. There is no system that counterparties log into and enter trade information (i.e., no order entry, no standing quotes, no interface where participants see or respond to each other). In the pilot process we've proposed on the site, a hedger's request comes to us, we run a solicitation with anonymized, parameter-only terms to a small number of panel members, the hedger selects a lead quote, and the trade is executed as a single bilateral confirmation between the two counterparties under ISDA documentation rules. Each negotiation is between a single hedger and single LP; we conduct solicitations sequentially rather than operating any many-to-many competitive process in the pilot. That being said, we're considering a lead-follow syndication structure for larger contracts in the future, in which a lead LP prices the risk and anchors the line and follower capacity subscribes at the lead's price through separate bilateral confirmations (again, under ISDA documentation rules). The execution of that structure (and where it sits in regards to SEF classification) is something we want to discuss with counsel prior to committing to either of the two paths. There is a reality in which we facilitate the many-to-many quoting process in the pilot program itself, given a proper feasibility study. The on-chain layer performs collateral custody and settlement only, after execution; nothing is priced, negotiated, or executed on-chain.*

     * Decide between the pilot being strictly one-to-one sequential RFQ processes and running panel solicitation / lead-follow immediately as an anonymized multi-quote process.
     * Number for range for "small number of prospective LPs"?
3. LP Panel.

   * What types of entitites;
   * Where they're organized;
   * How you confirm eligible contract participant status;
   * What onboarding & KYC we run.
   * *Prospective risk-warehousing counterparties on the stated contracts are professional trading and investment firms (e.g., event-volatility desks, fundamental biotech investors, dedicated risk-underwriting capital desks, and proprietary trading firms specializing in bilateral liquidity for bespoke / exotic asset classes – all based in the U.S.). Hedger-side counterparties are funds, holders of royalty or milestone payment rights, and biotech treasuries. All participation is limited to Eligible Contract Participants; ECP status will be confirmed at onboarding through written representations supported by documentation, with the biotech-treasury case relying on the hedging prong where applicable, and the verification procedure is something we intend to finalize with counsel. A KYC/AML onboarding program will be built as part of registration. Martingale has no affiliates, and neither Martingale nor any affiliate in the future will take either side of any contract, in any circumstance.*

     * Should we draft onboarding/KYC before approaching counsel (i.e., now)?
4. Whether Martingale or any affiliate take the other side of a contract.

   * *Both counterparties post full collateral at contract inception in USDC to a contract-specific escrow; there is no margin cycle and no unfunded exposure at any point in a contract's life. At resolution, an oracle writes the outcome from the pre-committed public resolution source and both sides' positions redeem automatically against it; a contract whose event cannot be verified from the committed source by the settlement deadline cannot settle and follows its specified fallback. The design principle for the escrow is that no single party, including Martingale, can unilaterally move collateral, and Martingale never holds client funds; our fee is invoiced separately in fiat and never passes through the collateral or premium flow. The current deployment is testnet only, with no value at risk. \[Current chain, admin-key confirguation, and upgrade/pause rights as they exist on the testnet deployment.] The production key and control, is an open design item we want to close with counsel's input on the custody and control analysis. Dispute handling beyond the resolution fallback is similarly to be specified in the contract documentation with counsel.*

     * Bracketed sentence? need to fill in with which chain the testnet deployment runs on or the current admin-key state.
     * Audit plans for on-chain procedures?
5. How Martingale is paid.

   * *Martingale is compensated by a flat arrangement fee, invoiced in fiat directly to the counterparties, earned only upon execution of a signed confirmation by both sides. The fee is stated separately from the premium in every document and is never netted against, added to, or collected through the premium or collateral flows. Martingale takes no spread, no position, and has no economic exposure to any contract's outcome. A transaction reporting service for applicable swap data reporting (SDR) obligations is considered as a later offering and would be separately priced.*

     * Whether the fee is better represented as a flat per-transaction amount, a % of notional, or a band we're still settling.
     * Whether the SDR process as a service should be mentioned here.
6. Ownership and people.

   * Entity and where it's incorporated;
   * Cap table including the investor's stake;
   * Who will be the principals and associated persons;
   * With any existing registrations, exams, or disciplinary history.
   * *Martingale Systems, Inc. is a Delaware corporation, certificate filed August 17, 2026, with an EIN issued and banking at Rho. I, Aditya Bhosale, am the founder and hold all issued stock. Talent 2026, L.P. (GP: Talent 2026 GP LLC), a fund managed by Grace Kasten and Cory Levy – two notable early-stage startup investors and managers of the firm Z-Fellows, holds two post-money SAFEs totaling $250,000, together representing approximately 9.25% on conversion, with a side letter granting pro rata participation and quarterly information rights; both SAFEs are standard unmodified Y-Combinator instruments. There are no other holders in the company as of now. I will be the sole principal and sole associated person at registration. I hold no current or prior registrations, have not yet taken any exams (will soon be taking Swaps Proficiency & Series 7), and have no disciplinary history of any kind. The company works with a small group of advisors from various trading, market-making, M&A, and compliance backgrounds; they are advisory only, hold no equity, and have no control or supervisory role.*

     * Swaps Proficiency status?
     * Whether any advisor has been promised equity?
7. Current status with NFA.

   * Anything filed;
   * Any communications with the NFA, CFTC, or the SEC;
   * Any prior counsel involved.
   * *Nothing has been filed with, and there have been no communications with, the NFA, the CFTC, or the SEC. No prior regulatory counsel has been engaged; the company's only legal services to date have been incorporation through a legal services provider (Soxton), and we have briefly interacted with Penn Carey Law's transactional clinic for general advice, although excluding any derivatives-related work. One threshold question we want addressed early in the engagement is precisely when the introducing-broker registration obligation attaches relative to our activity, so that pre-registration outreach remains clearly on the right side of the line; no solicitation or any transaction has occurred to date.*
8. Whether any contracts have been executed yet.

   * *No contract has been executed, offered, or proposed to any party specifically; the platform has never carried a live trade and exists on testnet only. No transaction has been solicited. **External materials to date consist of investor materials for our capital raise and the gated site (mechanism documentation & research program), which has been shared under per-recipient access control with investors, advisors, and a small number of industry contracts at trading firms with whom we have had exploratory conversations with about the model.** Those conversations sought feedback on the design; no terms were proposed in any meeting. Access to the gated documentation and research pages is included at the bottom of this letter.*
9. What materials have been provided to prospective clients, including access to the docs & research pages.
