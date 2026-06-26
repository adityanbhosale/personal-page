---
title: Behavior Optimization / ACF
topic: VSA Markets
date: 2026-06-26T19:03:00
---
Yesterday, worked around the circular-input issue with the agentic trader population underpinning the market maker itself (ended up quantifying minority pivotality & thresholds for manipulation costs for neutrality proofs).



My population is essentially `CredentialedTrader`, which samples a static signal once at init and pushes it through the LS-LMSR cost function; `NoiseTrader` is directionless. No learning, no strategy, no response to book state beyond `C(q)`. They're parametric stochastic processes whose only job is to move price via the cost function. "Agentic" is fundamentally generous – it's a liquidity-generating sampling process.

In order for my market structure to *behave like a real market*, I could follow **two paths:**

(A) *Behavioral realism of agents* – making them act like real traders (order-splitting, momentum, belief-updating). This would actively break the thesis. Pillar 3's result – sponsors can't set the price, substrate reverts to 0.5, only informed flow moves it – depends on the noise layer being dumb and directionless.

(B) *Microstructural face-validity of the market's output* – showing the price series and order flow my venue *emits* carry the universal signatures of real markets (square-root price impact, volatility clustering, signed-order-flow autocorrelation). This is defensible, demo-useful, and requires no changes to the agents intrinsic behavior – it's a measurement layer on the venue.

**Constraints on B:**

* Regimes: my real order-flow data is illiquid (NBA Finals at $32-41M OI, the cross-venue-eligible panel, active Polymarket books. VSA targets the illiquid tail, where essentially no real trade tape exists. I can't calibrate to real magnitudes without calibrating the wrong regime.

  * What would I need to claim that my thin-market regime matches real thin-market data?

    * A trade tape – not L2 snapshots – from *genuinely thin*, *resolved* markets. My frozen Kalshi/PM set is L2 snapshots of liquid markets, wrong on both accounts. The one place I already hold the right thing is the neutrality monitorL on-chain `OrderFilled` events are a real trade tape, and the thin-token makers are genuine thin-regime.
    * Breadth: thin markets are sparse by construction, so per-market power is low; anything finer than markout needs a panel – tens to low-hundreds of thin Polymarket markets – to get CIs that mean anything.
    * Flow labeling: "A small informed cohort drives price" is a claim about *who*, so I'd need wallet-level informedion/noise separation. My monitor already does this via persistent markout sign.
    * Outcomes, for any convergence claim. polymarket resolves (UMA); my frozen Kalshi set largely doesn't.
* What I *do* have tail-relevant ground truth on is my Polymarket neutrality monitor, which already measures the adverse-selection signature in the thin-token regime (bimodal markout, ~40/109 makers persistently negative, BUY-side thin-token toxicity). That's the closest I have to real tail-market behavior.

  * If my synthetic venue, under rising informed share, reproduces that signature – maker markout going negative exactly as informed flow rises – I've have shown that the substrate generates the *same pathology* I measured live, in the regime that matters, and I'd have tied the sim back to the empirical work I did via Polymarket WebSocket.
  * In the VSA model, the maker is the subsidized LMSR, so that markout *is* the sponsor's subsidy cost.
  * This is objectively a good next step.
  * Framing:

    * Scope of Facts: price-impact concavity, order-flow autocorrelation, markout-vs-informed-share
    * Cross-venue framing: name the distinction between LMSR & CLOB
* **Autocorrelation.** Signed order-flow autocorrelation (long-memory, Lillo-Farmer) is a deep microstructure fact. The catch is that long-memory flow comes from order-splitting of large meta-orders and from herding – two behaviors I excluded to keep the agent population neutral. My agents draw once and trade once; their flow is near-IID by construction. I'll see at most short-range sign persistence while the informed cohort is active, decaying fast – not the slow power-law of real flow.

  * The visual will likely show a mismatch, and fixing that would mean adding order-splitting/herding, which reintroduces the manipulability I already decided not to include. The null is the result – "My substrate carries no exploitable order-flow memory, consistent with neutrality."
  * Including autocorrelation comparison makes the ACF stronger: if real Polymarket flow shows long memory (it will – order-splitting & herding live in real flow) and my substrate is near-IID, the side-by-side is the point. "We predicted near-IID flow from the neutral-substrate design, and that's what we measured." ACF needs the real signed-fill sequence, so the recon I'll run shortly checks for that explicitly alongside markout findings from my Polymarket-Neutrality-Monitor.
* **Recon:** is there frozen per-fill tape, does it carry (or join to) a mid, and can I reconstruct a time-ordered signed sequence.

  * **Findings:**

    * Markout – intact. Per-fill, signed, mid-based, with the {2,10,30}s horizon dimension preserved, so the horizon-deepening discriminator – my honesty test on the real side – still applies. I'll use `maker_markout_b4.jsonl` (38,736 rows, 1,045 tokens, 1,880 makers, ~94% coverage). This ships with a real overlay.
    * Price Impact – dead. Fill price and mid are both absent, and the agent's correction is right: three markout equations in four unknowns is underdetermined, so I can recover inter-horizon mid increments but never an absolute mid or fill price. Realized impact-vs-size needse an absolute mid I don't have. This visual runs synthetic-only – keep it as "the LMSR produces a concave impact curve," drop any real-match claim.
    * ACF – salvageable, but not from the raw rows. The data is per-maker-leg: one taker sweeping N resting makers becomes N identically-signed rows at the same second. Feed that raw into an autocorrelation and I manufacture positive short-lag structure than an attribution artifact, not order-flow memory. The fix is to aggregate to per-(token, second) net-signed flow first, collapsing each N-maker event to one observation. Whole-second timestamps then make it a coarse, conservative proxy – which actually strengthens the contrast: if a conservatively-built real series still shows memory while my substrate is near-IID, the "we predicted neutral, near-IID flow and that's what we see" framing lands better.
* **Measurement-only build:** produce three real-vs-synthetic microstructure comparisons for the demo. AUDIT-FIRST.
* **Next Steps for Thin-Market Behavior:**

  * Microstructure – does the synthetic venue reproduce the statistical signatures of real price formation (impact shape, LP markout, flow memory)? This is a data capture question.

    * Does it match milestone markets specifically?

  1. Upgrade Data Capture – one redesigned capture would fix most of what broke: persist the CLOB mid joinable to fills (unlocks real price-impact-vs-size – the figure that failed – and proper mid-to-mid markout, killing the 3-equation/4-unknown problem); persist the taker-aggregate tape instead of per-maker-leg (kills the ACF attribution artifact); capture millisecond WS-receipt timestamps (lets ACF resolve sub-second splitting); run for days across the thin-token universe (turns n=3 adverse makers into a powered set). My build-4 shared pool already has the coverage infrastructure.

     * Max claim I can make is that we're reproducing the microstructure of a real on-chain tail panel.
  2. Closer Analogs – scan for traded markets structurally nearer a milestone binary: FDA-decisions, drug-approval, clinical-readout markets on PM/Kalshi – discrete resolution, small informed cohort, thin uninformed flow.

     * **BLOCKED**

       * Polymarket prunes intraday price granularity for old/resolved markets, so the historical mid is daily-only nine months out. That's not a tooling gap I can work around – the data is structurally gone at the venue. The "horizons" {2,10,30}s collapse to one daily point, markout sits at sub-cent tick-noise on a near-zero CRL'd token (+0.0005, IQR around 0), and I can't even assess horizon-deepening with one horizon.
       * The microstructure-match-to-thin-markets claim is now dead on all three regimes I could possibly access (liquid cross-venue, live Polymarket makers, resolved FDA catalysts
       * **The per-fill mid I need for markout is never durably available on these venues, by design.**
  3. Characterize the realism/neutrality frontier: instead of brute-forcing a match, quantify the tension I just ran into. Use the harness to progressively inject strategic flow – order-splitting, then momentum, then belief-updating – and measure both axes at each step: how much realism it buys (does concave impact appear, does flow memory appear) against how much it costs (Pillar-2 cost-to-manipulate falls, Pillar-3 seed-neutrality degrades). The deliverable is a frontier: realism vs manipulation-resistance. This is consistent with, not a reversal of, the earlier "don't sophisticate the agents" decision – the strategic agents live in a controlled experiment to prove the trade0off, then stay out of production. It converts "I couldn't match real behavior" into "matching real behavior provably requires the strategic flow that breaks neutrality – here's the trade-off quantified," which is sharper to hand a technical reader than a single matched figure, costs no new capture, and reuses my existing code.



# 3: Realism/Neutrality Claims

I'm going to prove that the realism my simulation 'failed' to show via comparison to real thin-market data is a feature, not a bug – by demonstrating that the only way to add it is to break the property that makes our model trustworthy.

I spent a whole session chasing the claim that my synthetic market behaves like a real market. I tried to show it in three ways:

* markout
* order-flow memory
* price impact

Each failed. The synthetic price impact came out linear instead of curved; the synthetic order flow had to memory; the real-data overlays I needed to prove a match turned out to be unattainable on Polymarket (the mid is pruned daily, the tape is too thin). Four figure, still no match to real thin markets. It's easy to read at this point that real markets are richer, my simulation isn't realistic enough.

**In reality, my simulation lacks those realistic textures for a good reason. I deliberately built them to be *dumb.***My noise traders are directionless; my informed traders draw a signal once and trade it; nobody splits large orders to hide them, nobody chases a trend, nobody updates their belief by watching the price. This is what my neutrality claim rests on. Pillar 3 showed the sponsor can't move the price because the crowd is non-strategic and reverts to 0.5. Pillar 2 showed an attacker can't lead the market because there's no reflexible flow to lead.



**What this build will do:** Instead of arguing this purposeful lack of strategy, I'll measure it. I'll take my existing neutral sim as the floor – call it Level 0 – and then add strategic behavior back in, one rung at a time, in increasing order of how much "mind" I give the agents.

* Rung 1: order-splitting – agents slice big trades into streams of small ones. This is the gentlest addition, and it's the one that should make price impact curve the way real markets do.
* Rung 2: momentum – some agents start trading in the direction the price is already moving. Now the flow has memory, like real flow. But momentum is reflexive: a market that chases itself can be pushed.
* Rung 3: belief-updating – agents start inferring information from the price itself. This is the most realistic and the most dangerous: it's the herding mode I flagged a while ago, where a manipulated price gets treated as signal and the crown piles in behind an attacker.

**Measurements:** does the realism appear (does impact curve, does flow gain memory – my old measurement layer), and does the neutrality hold (can the sponsor move the price now, can an attacker – my Pillar 2 and 3 tests).

**Deliverable:** single curve – realism on one axis, manipulation-resistance on the other, one point per rung. The expected shape is a clean downward trade-off – as I climb toward realistic behavior, neutrality falls, and the belief-updating rung is where it falls off a cliff. That curve says something we can't wave off – "Yes, our market is less 'realistic' than a real exchange – necessarily so, because the realism comes from exactly the strategic flow that a sponsor or attacker would exploit. Our substrate agents trade realism for neutrality on purpose, and here's the frontier that proves the price of each strategic addition."





**FINDINGS:**

* L0 reproduced the baseline to full float precision, the injection is byte-identical at intensity 0, every strategic variant draws the same RNG count as the agent it replaces, so strategy is the only varying factor.
* Phase 4 confirms no neutral agent, vendored file, or cost function was touched.



* Concave impact: restored by nothing. Exponent stays ~=1 at every rung. The agent's mechanism note is correct and worth absorbing – the square-root law is a *meta-order* property, and my per-fill impact measurement structurally can't see it; slicing a meta-order just adds small same-signed locally-linear fills. So FIG-4's "failure" was never going to be fixed by order-splitting - it was a measurement-level mismatch, not a deficiency in the agent substrate.

  * Clean answer to "why no concave impact"
* L2 momentum is the one real realism win – flow memory flips from -0.13 to +0.83 – and it costs Pillar 3, not Pillar 2 (seed-reversion deviation 0.003 --> 0.078). That's my thesis, intact, on one signature: restoring flow memory provably degrades neutrality.
* L1 & L3 erode Pillar 2 was buying almost no realism. This is the against-expectation result that matters most: order-splitting disarms the reactive defense (my credentialed traders become scheduled executors that don't lean in when the adversary pushes), so neutrality falls before you get any realism.
