---
title: product architecture / thesis
topic: VSA Markets
date: 2026-06-23T17:48:00
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
