---
title: "on-chain build: synthetic spot + options"
topic: VSA Markets
date: 2026-07-01T20:15:00
---
A subsidized harvest market maker that manufactures a continuous catalyst \*\*probability p\*\* (Layer 1 – synthetic spot), and a derivatives layer (perps/options on 'p') that funding-anchors to it (Layer 2). It inventories all relevant prior engineering and design work, states what is validated vs assumed vs unbuilt, specifies the target architecture, and lays out a phased, audit-first build plan with the security gate that must not be skipped.

**Manipulation-surface gate:** Layer 2 must not be deployed against a live Layer 1 until the manipulation-resistance result is re-derived with the derivatives incentive added. Everything else is sequenced around that.



## 0: Audit '`lmsr-preclinical-markets`'

LSLMSR.sol is live on Base Sepolia @ 0x747DF6BebC9A8fb208886270E5D333F79c48F812 (deployed Apr 22, a = 0.05, symmetric 100/100 seed --> price 0.5, 14 passing tests). It uses PRBMath UD60x18.

Public Surface: b(); cost(); priceYes(); costOfTrade(); trade(); resolve();

**Note:**

* trade() updates the q vector but does not move value – there is no USDC flow in the maker. So §2.2's claim that CCTP/USDC settlement "exists / reuse" is true at the SPV layer but not wired into the AMM trade path. Phase 1 will have to port the math + build the collateral leg.
* no access control on trade() – the ERC-3643 credential gate is staged, not built. The permissioned-vs-open decision is still fully open in code.
* it hand-rolls q-vector accounting, not CTF/ERC-1155.



**Layer-2 Anchor Argument is Grounded:** The SPCX/Hyperliquid proof-of-concept is the "easy mode" version of my funding-tether: priced $135, opened $150, closed $160.95 (19% pop), perp pre-converged to $157 – it matched the best forecast because Nasdaq was three days out to anchor the price.

My framing still holds – the perp borrows realness from a coming anchor; VSA manufactures the anchor. If I ever want the empirical version, the path is Refinitiv for the Nasdaq tape + Hyperliquidm (candleSnapshot) for the perp, with the HIP-3 SPCX symbol-resolution as the one catch.



**Note:** SolFi's prop AMM repels toxic flow (curve as O(1) quote-compression, exploiting Solana's CU fee market to re-quote fast against arbitrage); VSA harvests it because in an un-anchored catalyst market the informed cohort's adverse selection is the only signal. My "hedgibility is the regime boundary" claim is the line; a harvest-aligned maker doesn't need cheap re-quoting.



## 1: Layer 1 LS-LMSR maker with CTF-custodied positions. 

Working only inside vsa-onchain/.

Scope: build a binary YES/NO LS-LMSR maker that custodies CTF positions and moves USDC.

* No resolve / claim / settlement / payout logic (that's Ph2)
* No UMA integration
* No exp max-subtration / log-sum-exp. (Phase 1.5 – a ≥ 0.01 makes binary revert-safe without it)
* No N-outcome. Binary only
* No Layer 2 / perp / TWAP anything



## 2: Real CTF Fork Integration Test – Adds 1 Fork Test

Scope: The phase 1 mock's getCollectionId is a keccak stand-in. The true Gnosis CTF derives collection IDs via alt_bn128 EC point math – a different computation.

This test proves LSLMSRMaker.sol integrates correctly with the real CTF: same IDs, working split/merge. This math is chain-independent (i.e., either EVM or SVM) so I'm validating against a CONFIRMED deployment and it'll transfer to wherever I deploy (probabily EVM).



## 3: settlement: resolution (MOCK oracle) + maker self-redemption + subsidy-return sweep + seed-dilution fix.

## 4: wire a real OOv3-assertion resolution adapter, validated against REALUMA OOv3 + REAL CTF on a Polygon fork. RE-READ CLAUDE.md and DECISIONS.md first.Work only inside vsa-onchain/, branch main. Audit-first, STOP-before-commit. Nobroadcast, no remote, no other repo. End on the fork test passing (or a cleardiagnosis) + STOP.



# END OF SESSION RECAP:

Single repository (vsa-onchain) – from-scratch, audited, fork-validated on-chain implementation of Layer 1 (the subsidized LS-LMSR maker that manufactures a continuous catalyst probability p. + the resolution machinery that closes its lifecycle. Not yet built Layer 2 (perp/options on p).

Again, Layer 1 is the synthetic spot, Layer 2 is derivatives that funding-anchor to it.

Proved that Layer 1's economics are faithful to my off-chain validated simulation (i.e., the 'lower cost of capital' pitch), and reproduced the neutrality claim on-chain – that price reverts to 0.5 absent informed flow and the sponsor can't set it. Now that claim holds in Solidity as well as Python.

The CTF custody + OOv3 resolution is the on-chain part that makes p a real settleable instrument rather than a number in a simulation – traders hold real tokens, real collateral backs them 1:1, a real decentralized oracle resolves the catalyst.

* "the maker prints a probability" --> "a market whose probability is auditable and whose outcomes settle without the sponsor deciding them"

#### Decisions Already Made

* a ≥ 0.01 floor – keep the binary maker safe from PRBMath's exp overflow. But a also sets my recoup rate (2a • ln2) and price sharpness, so the production a is a real tradeoff I haven't made yet – I won't let 0.01 become the live value
* Gnosis CTF for outcome tokens – allows for transferability, a real sell-side, and the N-outcome path later.
* UMA OOv3 assertion model
* The seed is a pure pricing register – which is why the prior contract's seed dilution bug is structurally absent here
* maxLossBound corrected to the true LS bound – the ~23x fix that matters the moment we seed a market asymmetrically (which is necessary when expressing a non-50/50 prior)

#### What's Left to Build:

Layer 2 – the perp/options on p – untouched as of now.

Gate: Need to rederive the manipulation-resistance result with a leveraged derivatives incentive added to the attacker's  payoff.

* Leverage on p gives someone a concentrated reason to push the thin Layer 1 spot – and that attack was never really analyzed with leverage in the mix.

**Gate Results: Modeling Leverage**

* Gate that decides whether Layer 2 (perps/options on p) can be built. Extends the validated Pillar 2 manipulation-resistance result to the *leveraged* case (i.e., w/ derivative payoff); Gate A adds leveraged position on p to the attacker's objective

  * `max[ leveraged_payoff(∆p, L) – cost_to_manipulate ]`
  * asks how much the pivotal informed-share threshold rises with leverage.
* Modeling Leverage:

  * MARK (settles on instantaneous, manipulated p)
  * RESOLUTION (settles on the realized binary at the catalyst)
  * TWAP (settles on a time-average of p, the realistic middle, what real Layer 2 uses)
  * the MARK --> TWAP gap is a deliverable
* **run Phase 0 + the L=1 reproduction, which doesn't require X (avg % informed)**
* **supply X and the leverage range via 'polymarket-neutrality-monitor'**

  * The empirical proxy is ~13% of taker notional (=32% by fill count), adverse-selection volume share, ∆=10s, over 94% coverage. That's the informed-flow floor from real data – standard proxy family for X. Two caveats:

    * 13% is an upper bound of the sign-based definition, and true toxic informed volume is likely *below it*.
    * But Polymarket is the wrong venue for my ceiling. It's retail-heavy public-event flow. My venue would be permissioned, institutional, and single-catalyst – where the entire participant base is catalyst specialists. So the real X for my venue is plausibly far above anything Polymarket shows.
  * **NEXT STEP:**

    * build a demonstration that the mechanism works when its precondition holds – not evidence that the precondition holds.

      * X = 40%; Leverage = run the actual bracket (I won't assume a single L – rather than puck one leverage that passes, I'll run the Phase-1 bracket at X = 40% and let it produce the safe-leverage frontier – "at 40% informed share, the mechanism is manipulation resistant up to L*." That's a far more honest artifact than "we assumed 3x and it passed" ... of course it did.: it turns leverage from an assumption to an OUTPUT. If the frontier comes back as "safe up to 5x", I have a real number to show; if it comes back "safe only up to 1.5x," i'd have learned something..."

#### Grounding in Shiller:

p – catalyst prob. – is a canonical Shiller underlying. There's no liquid market quoting "the probability of this Ph3 meeting primary/secondary endpoint to X,Y,Z degree in either direction (±)"; VSA manufactures the liquid market, and the synthetic spot is the measurement.

Divergence:

* Shiller's claim is perpetual – never resoles (tracks an ongoing rent/dividend stream forever

  * VSA's perpetual terminates (catalyst is a hard resolution where p collapses to {0, 1} and the market halts & converts. So, VSA is a *bounded, resolving perpetual*
  * 'Shiller + a Terminal Event'
* Shiller's perp funds against an external index (i.e., his hedonic repeated-measures rent index).

  * VSA has no external index; Layer 1's LS-LMSR price is both the thing being discovered and the reference the Layer 2 perp funds to. That collapse from "external index + perp on it" into a self-referential loop is what makes VSA elegant and is the source of manipulation/anchor-inversion hazard behind Gate A.
  * Track B (public ticker rooted catalysts).
  * **Track B:**

    * markets on public biotechs' catalysts are most likely a SBS under SEC – not merely a CFYC event contract – because it references an event relating to a single issuer that directly affects that issuer's financial condition.
    * That single classification, if it holds, reshapes Track B into an **institutional-only (eligible-contract-participant), SEC-touching, permissioned venue –** not a retail or permissionless prediction market.
    * Gap: A fund long a clinical-stage name is, in substance, long *one Ph3 readout* – but the only tools act on the whole company. Listed equity options don't exist, or are wide and illiquid, for a specific program or data window; shorting the name to neutralize the catalyst inherently includes pipeline, cash-runway, platform, and macro basis the trader doesn't want.
    * Today, this process is done bilaterally, OTC, expensively – trade process exists, done badly.
    * **Instrument:** subsidized LS-LMSR maker aggregates the informed cohort for a target/modality into a continuous catalyst probability p ∈ (0,1) – the synthetic "spot" of the event – and an option surface is written on p. Participation is **permissioned & institutional** (ECP-eligible, KYC'd via an on-chain identity layer), which is appropriate to the instrument and to do the counterparties who want it.



## At this point, Layer 1's contracts (CTF, Adapter, Maker) are all on-chain; Gate A demo is done & assumptions marked, and options-framing is recorded. Everything's backed up across 5 repos + vsa-meta's README.md**.**



## **Next Step:** Subsidy + Smoke-test

*Turns "live and pricing" into "demonstrably trades" – requires USDC faucet.*

1. Get testnet USDC into my deployer – the maker needs a USDC reserve, and i need USDC to buy with.
2. `fundSubsidy` – approve + fund the maker's reserve (~6.93 USDC, my corrected maxLossBound for a = 0.05, symmetric 100/100).
3. Smoke-test buy – approve USDC to the maker, then execute a small buy, then verify the position landed and the price moved.
