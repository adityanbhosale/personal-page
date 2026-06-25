---
title: product architecture / thesis
topic: VSA Markets
date: 2026-06-24T23:59:00
---
### Mechanism

Sponsor subsidizes a continuous LS-LMSR market to discovery the probability of a discrete R&D milestone; that price reprices a financial instrument tied to the firm's asset/IP; the repricing benefit justifies continued subsidy.

Value Prop: coupling between the instrument the market trades (milestone position) and the instrument that gets repriced. Every layer below exists to facilitate that coupling and enforce verifiability.

This is an issuer model, not a protocol.

### Layers

1. Asset – turns a milestone claim into a sponsor-funded tradable position, and issue the repriced instrument it's coupled to.

   * dual-layer / RWA tokenization
   * LS-LMSR for illiquid markets
   * Open Question:

     * Which instrument to originate? CVR-like royalties, SPV tranche, milestone note?
2. Trust – cryptographically prove the discovered price is neutral – not self-dealt by the sponsor, not picked off by faster capital.

   * microstructure (builds 1-5)
   * verifiable / neutral clearing mechanism
   * Open Question:

     * Is the proof legible to a non-crypto buyer (i.e., auditor, CFO, etc.)?
3. Market behavior – how the market prices, behaves, and resists manipulation; regime-condition clearing at catalyst windows

   * event-contract microstructure
   * FBA counterfactual
   * Open Question:

     * Does a thin, sponsored market price hold up against a real catalyst spike?
4. Resolution – how a milestone market *ends* – wiring the endpoint to an authoritative source, with a dispute path

   * Open Question:

     * who adjudicates an ambiguous readout, and on what evidence?
5. Sponsor Economics – who pays, why, and whether the price is worth more than the subsidiy. this is the demand side

   * Tetlock-Hahn applied
   * coupling test
   * Open Question:

     * Does the sponsor benefit exceed the LMSR max loss for a real asset?

### Decision Point – Coupling Mechanism

*"Price discovery reprices an instrument"* can mean a ton of different things. Essentially, this coupling mechanism (and it's neutrality / verifiability) is the true value proposition here.

1. Informational Coupling – price acts as a reference number which the sponsor may choose to consider. Essentially selling a forecast. Customer in this case is an IR/comms team.

   * quite weak
2. Valuation-standard Coupling – the price feeds a recognized fair-value methodology (i.e., ASC 820 Level 4, 409A, fund NAV).

   * defensible on an otherwise-unmarkable asset.
   * Customer in this case is a controller / auditor / fund CFO
   * Illiquid biotech R&D presents the issue where 'marks' are just speculations
3. Contractual / mechanical Coupling – the instrument's terms *reference* the price – conversion, coupon, NAV mandate, CVR interim transfer value. This way, real money moves with the probability.

   * Customer in this case is a CFO / treasurer
   * This is the strongest case as it requires an issuer to manage it. It makes the prediction-market load-baring by construction.

*You can't bind a contractual coupling onto an instrument you didn't structure yourself.* The path to being an issuer and the path to building a strong coupling mechanism are the same.

Looking at the **asset layer**, I'm not proposing to 'tokenize a milestone claim,' but rather 'originate a repriced instrument whose valuation is methodologically or contractually bound to the discovered price.

### Decision Point – Repriced Instrument

1. CVR (contingent value right).

   * Reprices via interim transfer value.
   * This makes sense if you want the purest milestone-coupled security and a secondary-trading use case
   * This doesn't make sense if you need a *primary financing event –* CVRs are deal byproducts, not capital raises
2. **Milestone-contingent note / SAFE-like**

   * conversion price or coupon steps on the probability
   * This makes sense if the sponsor is *raising capital* *now* against the milestone (clean cost-of-capital narrative)
   * This doesn't makes sense if the sponsor isn't actively financing; nothing to attach to
   * ONLY OPTION WHERE COUPLING DRIVES A LIVE FINANCING DECISION && THE CONVERSION-REFERENCES-PRICE MECHANISM IS CONTRACTUALLY CLEAR
3. Single-asset royalty interest

   * NAV / mark for the holder
   * This makes sense if the holder is a fund needing defensible marks (recurring buyer)
   * This doesn't make sense if the asset has no royalty structure yet – we'd be creating cash-flow rights from scratch
4. Single-asset SPV equity tranche

   * NAV mandate
   * This makes sense if you want full control of the wrapper (closest to the dual-layer model I previously built) and a captive sponsor
   * This doesn't make sense if the regulatory/setup cost is too high for an initial model

The royalty/SPV are the recurring-revenue versions to potentially expand into; the CVR is a weak commercial thesis.

### Regulatory & Accounting Considerations

Of course, a market that reprices a security is making a fair-value claim with **securities-law and audit consequences**. I.e., the stronger the coupling between layers, the heavier the regulatory concern.

### Sponsor Economics

Tetlock-Hahn, made concrete, is as follows: *the sponsor's benefit must exceed the LMSR max loss they fund.*

The benefit of that price discovery takes one of three forms (matching the customer classes above).

* usable forecast
* cost-of-capital reduction
* defensible Level-3/NAV mark

Notably, the subsidy side is quite favorable in biotech specifically: a strong base-rate prior (clinical phase-success by indication) means the maker only has to price the *residual* uncertainty, so the max loss is small compared the value of the decision/valuation produced.

**Decision:** underwriting on cost-of-capital makes the most sense, as the defensible mark is inherently complementary. It's hard to quantify 'usable forecast'. CoC is the only metric that's large, quantifiable, and recurring

* a credible continuous probability on a milestone lets the sponsor raise milestone-contingent capital at a tighter spread, or mark an existing instrument higher, and that ∆ is promising.

**ASC-820 (US fair-value accounting)**: ranks valuation inputs in three tiers:

* Level 1 = quoted prices in active markets (a liquid stock)
* Level 2 = observable inputs other than quoted prices (comparable trades, yield curves, etc)
* Level 3 = unobservable inputs (mgmt's internal models & assumptions)

  * all early-stage R&D assets, CVRs, or private royalties are Level 3; marked by a DCF with a internally-derived PoS the holder picks (or an advisor picks, i.e., an investment bank)
  * the value-proposition here is that the market-price derived by an on-chain, verifiable / neutral prediction market sponsored by the holder can replace that internally-derived PoS with an *observed one*

### Potential Revenue Model

Some combination of issuance fee, subsidy management, and a take on the market.

### Risks

The issuer / mechanical-price-coupling model is a high regulatory load. 3 major risks:

1. Auditor Acceptance – if a thin sponsored price is not a recognized fail-value input, the valuation-standard and mechanical products both collapse to a 'forecast'.
2. Conflicted-Issuer Problem – you issue the instrument, run the market, and the sponsor funds the subsidy

   * verifiable neutrality is key to make that trustworthy, and even a clean proof may not beat the optics for a conservative counterparty.
3. Issuer Model Concentrates Regulatory & Legal Cost



# Integrated Codebase for v0:

Goal: a self-contained end-to-end simulation of the sponsored-aggregation loop – a sponsor funds an LS-LMSR subsidy; agents trade a milestone market; price path; a milestone-contingent NOTE reprices via conversion (contractual coupling); sponsor's realized cost-of-capital ∆ vs. a no-market baseline; a neutrality-proof artifact.

#### **Findings:**

The verdict is KILL in both regimes tested. Under heavy informed flow, the maker *did* start being adversely selected (deepening flipped True), but it stayed immaterial in dollar-figures (~$2.79) because **an LMSR reprices on every trade, so a sharp informed wall makes the price efficient fast rather than leaving the sustained post-fill drift that large negative markout needs.**

In other words, my simulated sponsored LMSR maker is *structurally more robust to adverse-selection than the CLOB makers my initial monitor measured on live Polymarket orderflow.*

###### *Live Deployment: https://aggregation-demo-cyan.vercel.app/*

### **Clarifications**

1. What "issuer, not protocol" means.

   * Issuing the note means creating and selling the security – acting as the legal entity that structures the instrument, defines its terms and places it with investors. A protocol, by contrast, just provides infrastructure others use to issue (i.e., Uniswap doesn't own the tokens traded on it).
   * We can only write a *binding* coupling onto an instrument we control the terms of.
2. Sponsor Self-Dealing – what that actually looks like

   * *sponsor's paying for and standing up the exact market whose price determines how much their asset is worth.*

     * motive & means to push price in their favor by seeding trades
     * i.e., seeding the market at an inflated prob.; trading into their own market through a sock-puppet to lift the price before a financing; choosing market parameters (liquidity level, resolution source, when the market opens/closes) to bias the outcome; quitely halting/restarting if the price moves against them
     * proved via 'material harm to the maker' / post-fill markout
3. Sponsorship/Liquidity Flow – how companies can fund a working market.

   * An LS-LMSR market doesn't match buyers to sellers as in a CLOB ; an AMM quotes both sides continuously, and someone has to fund that maker's worst-case/base loss. That funder is the sponsor.
   * Mechanics:

   1. the sponsor deposits a subsidy (the LMSR's bounded max loss – in my simulation ~$2.86 for the chosen liquidity parameter; in reality a function of how much depth the sponsor wants for credibility sakes). 
   2. That subsidy capitalizes the automated maker, which then stands ready to take the other side of any trade at the LMSR-determined price.
   3. Now the agent trader population transacts against the maker: the **informed human traders** *(TA specialists, analysts, people with any read)* buy or sell based on their private view, moving the price toward their belief; the **agentic/noise flow** trades for non-informational reasons & provides **churn**.

      * The maker absorbs all of it – its price updates after every trade per the LMSR cost function. The sponsor's subsidy is what makes this possible – without it, there's no counterparty and (per Milgrom-Stokey), no market.
   4. If the milestone resolves and the maker ran a profit, that returns to the sponsor. If it lost up to the bound, that loss is the price the sponsor paid to buy a credible probability.

      * The **subsidy is the cost of information**, **not a trading loss**. (Tetlock-Hahn)
4. How Cost of Capital ∆ is measured.

   * WACC is just the *rate of return a financier demands to provide money,* expressed as a %. If a biotech raises $1M and the investor requires 15% return, the cost of that capital is $150k. Lower cost of capital is obviously in the best interest of the company.
   * In this model WACC is calculated as `r = r_base + π`, where r_base is the baseline financing rate (what any borrower pays) and π is the risk/information premium – the *extra* return the investor demands because they're uncertain about, and distrustful of, the milestone probability their note is priced on. The ∆ (the saving0 is measured as a straight before/after comparison of the financing cost of the *same note*:

     * **Baseline:** the note is priced off the sponsor's self-reported prior probability, and because the investor distrusts a self-reported number, they charge a high premium π_high (12% in the sim – although that's an average WACC, or Ke, for any clinical-stage private biotech, in fact on the lower end). Financing cost = `note_value(p0) • r/(1+r)` with that high rate --> $202,474 in the sim.
     * **With-market:** the same note is priced off the *independently verified* market probability, the investor trusts it, charges a lower premium π_low (4%, improbable for biotech, needs to be adjusted for realism) --> $133,373 in the sim.
     * **∆ = baseline – with-market = $69,101**. That's the proposed saving for the sponsor.
   * The saving results from the **level channel** (the probability itself changed, p0 0.70 --> p_mkt 0.728), which moves the note's value – generic to any forecast, and in my simulation slightly negative – versus the **premium channel** (12% --> 4% at the *same probability*), which only exists because the estimate is *verifiable*.

     * **The saving lives in the premium, not the probability itself. A better point estimate isn't that valuable, trust in the estimate is what generates value.**
     * Important: `note_value • r / (1+r)` is a *sylized one-period cost of carry*, not how a real convertible's WACC is computed (which really involves the conversion option's value, dilution, time to milestone, discount rate). My simulation is a mechanistic demonstration, not a true pricing model.
5. Verifiable Neutrality & Use-Case

   * In the orderbook clearing context, neutrality is used to prove the maker wasn't picked off (adversely selected), or prove the mid price was fairly computed.
   * In a stakeholder market, however, "neutral" doesn't mean "the maker didn't bleed value", it means **"the sponsor didn't rig the price their about to reprice their own asset against"**.

     * Verifiable Neutrality is the cryptographic answer to every self-dealing vector considered:

       * prove the market was seeded at a declared prior and not silently re-seeded;
       * prove the sponsor didn't trade into their own market;
       * prove the resolution followed the pre-committed source and rule;
       * prove the parameters weren't changed mid-flight;
       * prove the price the note references is the actual market-cleared price and not a cherry-picked snapshot of trade convergence
   * In other prediction markets (Polymarket, Kalshi), no participant is pricing their own security off the result, so neutrality is a nice-to-have feature. Here, the sponsor is, so the price is only worth anything to an *external party* – the investor or auditor – if that party can verify the incentive-crossed sponsor didn't author it.

     * Without proof, you can't claim a "market price," just a number the sponsor produced internally.
     * **Verifiable Neutrality is what converts π_high into π_low.**
6. Note mechanics / repricing logic

   * *Traditional milestone-contingent convertibles (SAFE-style)*: a sponsor raises cash now (face F) by selling a note that doesn't pay interest like debt; instead it converts into equity at a future event – here, the milestone resolution. 

     * The note specifies what the holder gets in each outcome: if the milestone hits (YES) the note converts into equity worth more (because the asset is de-risked); if it misses (NO) it converts into less.
     * Traditionally, the conversion terms are fixed in the contract, negotiated up front off the parties' *guesses* about the PoS.
   * Value Proposition: *repricing off the continuous market*. Instead of fixing conversion off a guessed probability, the note's conversion economics reference the live market-implied probability *p*.

     * `note-value(p) = g(p) • [ p • V_yes + (1-p) • V_no ]`
     * That last part in \[ ] is the **probability-weighted expected conversion value** – what the equity you convert into is worth on average given probability p (Y_yes = $1.4M, V_no = $550k).
     * g(p) is the **conversion ratchet** – a multiplier that runs from 0.97 (at p = 0) to 1.10 (at p = 1), so a higher market-implied probability earns the holder slightly more favorable conversion. As the market price p moves, `note_value(p)` moves with it – that's the contractual coupling, and it's why panel 3 of the demo lets the user scrub p and watch the value reprice.

       * **The point is that conversion isn't a negotiated guess anymore; it's bound to *an observed, continuously-updating, verified probability*.** 
   * A verified price for an asset is cheaper to borrow against because when an investor buys a note, they're taking on the risk that the probability it's priced at is wrong. Two sources of uncertainty, science & valuation integrity. If the probability is the sponsor's self-reported figure, the investor assumes it's optimistically biased, so they pad their required return with a large premium to protect against being lied to (π_high). If the probability comes from a market the investor can verify was neutral – not seeded by the sponsor, not traded by the sponsor, resolved by a pre-committed source – it's trustworthy.

     * Not enough uninformed hedging flow for a completely unsubsidized LS-LMSR market, not enough liquidity.
     * So we can try to build a subsidized prediction market on an asset that's verifiably neutral, so as to have the same valuation effectiveness & trust as an unsponsored true market.
     * Lower premium = lower required return = lower WACC = sponsor raises the same money for cheaper.
   * **Quiet vs. stress/catalyst regime:**

     * two distinct market condition, different levels of informed trading
     * Quiet: ordinary times – little new information, mostly noise/agentic flow, price drifts near prior
     * Stressed/Catalyst: high-information period – trial readout, PDUFA date, data release – when informed traders with real signal pile in and the price moves sharply.
     * I'm proving that an LMSR maker holds up without any adverse selection / - markout in both regimes – this is the value of credibility compression
     * *The regimes are my stress-test, and passing both is what showed me the differentiator isn't "we protect the market under fire," it's "we make the price trustworthy regardless."*
