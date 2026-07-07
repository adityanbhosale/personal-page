---
title: neutral agents codebase / LOI prep
topic: VSA Markets
date: 2026-07-07T09:20:00
---
# Letters of Intent

### MD @ LEERINK:

Framing: Two-layer catalyst-volatility exchange on-chain. Leerink cannot provide an LOI since they can't trade catalyst vol, especially on an unregulated testnet. CAN provide a LETTER OF INTEREST: short note in his own words validating the pricing gap, that he sees it in how these assets actually get valued, and that the approach is credible.



Model Walkthrough: Essentially an instrument to value individual catalyst events under individual programs. Street expresses this catalyst view before resolution via equities & options that bundle the catalyst with everything else moving the stock (i.e, macro, other assets, internal financing). This is sort of why CVRs exist, because buyers and sellers can't agree on catalyst-contingent value, so they write it into a cotract.

I'm building that missing market structure – a verifiable, continuously-updating price for an individual catalyst, with a thin derivatives layer so that risk can be isolated, traded, and hedged directly.

**What's Built:** Layer 1 (the synthetic spot price based on a Liquidity-Sensitive LMSR automated market maker for thinner markets) is deployed as a live event contract on a testnet chain (which helps prove how manipulation-resistant the underlying spot will be, which is crucial in thin markets where bad actors could easily bias price discovery).

At the moment, I'm building an initial version of the perps/options layer on top, as well as doing some regulatory mapping to understand what the path is to get this to be an onshore, CFTC-regulated decentralized exchange, similar to what Kalshi's doing with the perpetual futures they're hosting.

Actually just submitted a public comment to the Secretary of the CFTC on their recent Proposed changes to Prediction Market jurisdiction, making a case for why a event contracts on scheduled, objectively-resolved corporate & regulatory catalyst events should be covered by the commission & why it satisfies their criteria for markets that act in the public-interest.



**Who'd use this?**

The direct customer buy-side event-vol – I mean these funds are already trading catalyst risk, just very imprecisely in my opinion, through equity options and sizing around dates; this market structure would let them express a clean view on the magnitude of a specific readout or hedge a concentrated catalyst exposure without the macro/financial noise in equities.

And for a bank, continuous, credible price discovery on catalyst-contingent value could be a strong input for how these assets are valued in deals and financings.



**What I need:**

I'm raising a small pre-seed in the next month. The investors I'm talking to can evaluate the mechanism & the code quite accurately, but they don't have the biopharma depth to know whether the underlying problem is validated. So, a short note from someone who's tenured in pricing biopharma assets – i.e., saying in your own words that catalyst price discovery is a genuine gap you observe and the approach is credible – would be more convincing to them than anything I can prove through code.

I can draft something up that's easy to edit so it'd just take a few minutes for you to read through. But curious if you'd be willing to write something like that for me?











\--------------------------------------------------------

**Weakpoints:**

* does an auditor accept a thin sponsored price as a Level-3 input
* is the convertible math robust
* is the agent population neutral

**Segments:**

* auditor / valuation-MD (most-binding): need a technical opinion – "would you accept this as an ASC-820 Level-3 input, and under what conditions?"
* sponsor side (biotech CFO / BD / royalty holders): "we'd run a milestone market on asset X if the mechanism worked."
* capital side (financiers who'd price the note premium): need them to validate the *premium-compression* claim – would they genuinely charge a lower premium against a verified price?
* mechanism-credibility (microstructure / market-design people): need them to validate the agent population & neutrality.

# Agent Population – Codebase

Inherently, a sponsored market whose price is set largely by my agentic traders is theoretically the opposite of neutral. Agents must be calibrated to converge to truth, demonstrably, & verifiably – measured against real off-chain / on-chain market behavior and provable to a third party.

* agent classes;
* benchmark that compares the agent-driven price path against real analogous market behavior;
* A/B / ablation tests to show convergence is robust and not an artifact of a particular agent mix or seed;
* neutrality/manipulation-resistance demonstration – show the price converges to truth even when an adversarial or sponsor-aligned agent tries to push it, which is the literal answer to "can the sponsor rig it."

#### **Recon Prompt:** For convergence-and-neutrality validation around the existing two-class agent population (CredentialedTrader + NoiseTrader).

Goal: Prove that the agent population produces TRUSTWORTHY, well-calibrated, manipulation-resistant prices – provably, and benchmarked against real market behavior – i.e., the answer to the skeptical question of "how do you know your agents converge to truth?"

**Findings:** circularity problem is universal and unsolvable by any internal metric. Every Brier score in each of my previous builds is calculated as (price – p_star)^2, scored against the latent parameter the signals were drawn from. A market converging to its own own true_p is mechanically guaranteed, not evidenced. So, what's not circular?

1. Adversarial truth-restoration should be the lead

**Current Population:**

1. **CredentialedTrader (**`sim/agents/credentialed.py`**)** – confirmed uses a static-signal PROXY, drawn once at init, never re-sampled.

   * decide() reads only price_yes and b; edge = signal – price_yes; trades size = aggressivness • |edge| • b toward the signal if |edge| ≥ min_edge.
   * Likely to be contested proxies:

     * no belief updating – real informed traders Bayes-update on order flow, this one holds a fixed point estimate forever
     * no budget/inventory/risk limits – unbounded repeated trading
     * size ∝ b is a modeling convenience, not a microfounded demand
     * homogenous signal precision (one σ)
     * no strategic/timing behavior (no order-splitting, no adverse-selection avoidance)
2. **NoiseTrader (`sim/agents/credentialed.py`) –** uniform direction rng.integers (0,2). Proxy: zero-information symmetric, memoryless – a stand-in for "uninformed flow," not a calibrated noise model.

Both traders move the LS-LMSR price only through execute_trade(), where (price = softmax(q/b)); there is NO ORDER BOOK, so "manipulation resistance" here means *cost to move the cost-function price,* not book spoofing.

**Circulatory Concern:**

The claim that "the market converges to true_p" is circular by construction. signal ~ N(true_p, σ) --? price = size-weighted mean of active signals --> true_p by Law of Large Numbers. Brier/convergence are then scored *against* true_p, the **same parameter the signals came from**. A single market hitting its own true-p is mechanically guaranteed; it's not evidence of truth-finding. **Every Brier in every prior repo is (price – p_star)^2, marked against the latent parameter, never a realized outcome. No repo samples Bernoulli(p_star).** So the circularity is universal, not specific to our minimal vendored subset.

Potential Work-Arounds:

1. Adversarial truth-restoration ~ STRONGEST, genuinely non-circular.

   * Introduce a manipulator **not seeded from true_p** which pushes price toward a target away from truth; measure whether the informed population restores truth, how fast, and at what cost to the manipulator.
   * Non-circular because it tests truth *winning* a contest against a *non-truth force* – the "can the sponsor rig-it" question
2. Real-market dynamics benchmark – THIN, non-circular.

   * The sim's convergence shape/speed/event-response compared to real resolved markets, whose dynamics are independent of our generator. Genuinely external, but the data is severely limited – usable for a qualitative "does it move like a real market" sanity check, not a powered statistical claim.
3. Calibration across a suite – NECESSARY, not sufficient, semi-circular.

   * Run many markets at varied true_p, resolve ~Bernoulli(true_p), score price vs realized outcomes (Brier/reliability curve). This **can falsify** – it catches systematic miscalibration from LS-LMSr spread bias, finite-N signal-mean error, or maker skew – but **a pass is weak evidence** because price = true_p and outcome~Bernoulli(true_p) make calibration hold nearly by construction. Frame it as a **bias detector / falsification gate, not proof.**

In the circular setup, the market seed, informed agents' beliefs, and everything else all pointed at true_p, so convergence was mechanical. The fix is to deliberately *separate* them so that "price tracks the informed cohort" and "price tracks the agents/seed" make different, distinguishable predictions – then show which one wins.

* seed the market at a neutral or deliberately-wrong value
* given the informed agents a belief that *differs* from the seed
* make the noise agents directionless (not centered on the informed belief)
* ask: does the resting price move to the informed belief, or stay at the seed / wander with the noise?

  * If informed-controlled and agent-controlled predicted the same price, the test proves nothing
  * Forcing them apart is what converts it from tautology into a real, falsifiable experiment about who controls the price

###### **Build 1: Validation Harness (post-recon).**

Non-circulatory design principle: market seed, informed agents' belief (p_informed), and the noise distribution MUST be set independently so that "price tracks informed" and "price tracks seed/agents" predict DIFFERENT prices.

Seed the market at a NEUTRAL or deliberately-OFFSEt value (i.e., 0.50, or a value far from p_informed); give CredentialedTraders a belief p_informed that DIFFERS from the seed; keep NoiseTraders directionless (not centered on p_informed). If the experiment is set up so informed-controlled and agent-controlled give the same prediction, it proves nothing and must be rejected. Never seed at p_informed. Never let the agent defaul/seed coincide with the informed belief.

**Results: the mechanism's core claim – a thin informed minority controls a stable price that a neutral agentic substrate makes liquid – is demonstrated non-circularly, with the threshold (~2%) honestly reported as a best-case floor that Pillars 2-4 will pressure-test upward.**

* A small informed minority is pivotal – it controls the market's resting price against a large directionless agentic majority. Price settled at ~0.748 from a 0.50 seed toward the informed belief of 0.75.
* The pivotal threshold (control ≥ 0.9) is ~2% of the population – but this is the floor, an artifact of two favorable conditions: a near-perfect informed signal (informed_sigma = 0.01) and directionless (mean-zero) noise, so the informed cohort is the only directional force in the market
* The decline is monotone – even at 1% (2 agents) price is pulled 82% of the wya to the informed belief, though it stops settling tightly.
* **Depth changes stability, not control** – as liquidity/subsidy rises, the control metric stays flat (~0.984) but path volatility and worst single-tick jump fall quickly. This reproduces the initial cold-start finding: with no depth the first trade moves price unilaterally (0.32 jump); deep markets move smoothly and hold.
* the experimental separation is real, not nominal – seed (0.50) ≠ informed belief (0.75), offset enforced in code (**post_init**) refuses to run if they coincide), noise genuinely directionless, and the control metric distinguishes "tracks informed" (1.0) from "stuck at seed" (0.0). Thus, the result is non-circular.

**Flagged Caveats:**

* informed flow is still a static-signal proxy (sampled once at init) – carried forward, not hidden.
* 2% threshold reflects **non-adversarial** noise only; the real "can the sponsor rig it" test is Pillar 2 (adversary pushing against the informed cohort), where the threshold will rise
* A **new dependency** (pandas) was pulled in by the mandated vendoring of convergence_tick –– flagged, pinned, added to requirements.txt
* b-runaway observed at low informed fractions (b grew x140-243); labeled, doesn't affect the pivotality conclusion (price still settles)
* `informed_sigma = 0.01` models experts as near-identical and near-correct – unrealistic; real experts disagree. (This is why I initially flagged adding a realistic-dispersion robustness cut to Pillar 4).

##### **Build 2: Adversarial Manipulation-Resistance**

This tests whether the informed cohort WINS a contest against a non-informed pusher – non-circular by construction. Relabeling holds (p_informed = informed cohort belief, never "truth").

Setup – 3 distinct points so the resting price discriminates among outcomes:

* seed at p_seed (i.e., 0.50). informed believe p_informed (i.e., 0.75). adversary pushes toward p_target chosen DISTINCT from BOTH (i.e., 0.30 or 0.95) so "informed wins" (price --> 0.75), "adversary wins" (price --> p_target), and "stuck" are all distinguishable. asset p_target ≠ p_informed ≠ p_seed in code.
* extend the vendored single-shot AdversarialTrader to a SUSTAINED, TARGET-SEEKING pusher: it trades repeatedly to drive and HOLD price at p_target, with a configurable capital/size budget.

**Result:**

Answer to "can a sponsor rig it" – theoretically no. The frontier discriminates correctly (3 distinct anchors: seed 0.50 < informed 0.75 < target 0.95, so informed-win and adversary-win land at different prices).

**At any finite budget tested (≤1000), the informed cohort defeats the adversary at every fraction down to 2% – the adversary exhausts its capital AND informed below ~5-10%; at ≥20% informed, the price holds even against an infinite-budget attacker.**

The agent proved the experiment isn't rigged toward the informed by *showing the adversary genuinely wins in the unlimited-capital + tiny-informed corner.* That's the credibility feature – a test where the defender always wins is not a good test; this one involves the defender losing exactly where theory says it should.

##### **Build 3: Substrate Neutrality**

Testing whether my own agents are secretly setting the price. Once this lands, I'd have close all three versions of the skeptical questions I outlined earlier today: outsiders can't rig the price, the minority of informed traders that should control price do, and my own population imposes no meaningful direction.

##### **Build 4: multi-seed CI bands; realistic-dispersion pivotality cut; fixed-b market variant; widened adversary budget to determine the finite-budget win-transition**

Cost-to-manipulate came back LOW, and the agent reported it straight instead of softening it. Net cost-to-hold is ~$154-$483; the adversary holds *fair-valued inventory, so the real barrier to rigging is gross capital (~$8.5k),* not a net loss they absorb. In order words, an attacker doesn't lose much to manipulate - they tie up capital in a position that's worth roughly what they paid, and the ~$20k finite-budget figure flips a 2% market..

What's found to be defensible: **who wins is NOT identical between fixed-b and standard.** The LS-LMSR b-growth – the thing that looked like an accounting feature – is itself part of the defense: as the adversary trades heavily, b grows, which amplifies informed flow's ability to push back.

So in a real (standard market), the adversary's ~$20k flips a 2% market but a 5% market only partially flips even at $100k.

*The net cost to manipulate is low, but the gross-capital barrier plus LS-LMSR's b-growth defense means that beyond ~5% informed participation, even a $100k adversary can't fully rig the price.*

# **RECAP**

**Initial Goals:**

* Compile / Build out the agent-trader population – the most proprietary part of the model and the part we'd own end to end.
* Treat integrity, A/B testing, and neutrality vs. analogous markets as the core concern, because a sponsor setting the price is a valid point of concern.
* Decision made up front: **prove convergence / control with the existing two-class population before adding complexity (**benchmark-first, no new archetypes**)**.

**Key Reframes & Conceptual Shifts:**

* I realized that any synthetic agent population converging to a true_p it was seeded from is fundamentally tautological. In a fully synthetic sim, "truth" is the generator, so no internal metric escapes circularity.
* The solution: **the sim's job isn't to prove the price is correct.** The VSA market doesn't *originate* truth – it *aggregates and amplifies the small real informed population that already exists in a TA/modality.* The agents + sponsor subsidy are a liquidity substrate, not an information source.
* So the claim changed from "our agents converge to truth" (circular, indefensible claim) to "a small informed minority controls a manipulation-resistant price against a large neutral agentic majority"

  * inherently a mechanism-rooted claim, non-circular, more defensible
* Relabeling enforced everywhere: true_p --> p_informed ("the informed cohort's belief"); never "truth" in code, output, or artifacts.

**What the recon found (before building)**

* `lmsr-preclinical-markets` already contained most of the validation scaffolding (Brier, k-consecutive convergence, attack/recovery metrics, a single-shot adversarial agent, a 2,400 run sweep) – none were previously vendored into this repo.
* The circularity was universal, baked into every repo's metrics (all Brier scored vs the latent parameter, never a realized outcome) – not specific to my code
* The current population is **two classes:** `CredentialedTrader` (informed, static signal, sampled once at init – just a labeled proxy) + `NoiseTrader` (directionless). Both move price only through the LS-LMSR cost function (THERE'S NO ORDER BOOK).
* The real-market comparator (`kalshi-polymarket-microstructure`) is severely data-limited (no recorded outcomes, no trade tape) – supports only an illustrative "looks market-like" check, not a powered claim. This was intentionally dropped from the build because it tests correctness, not mechanism.

**What was built – the four-pillar harness (`validation/`)**

* **Pillar 1** – informed-minority pivotality: sweep informed:agent ratio with seed ≠ infgormed belief (enforced in code), directionless noise, a control metric that distinguishes "tracks informed" (1.0) from "stuck at seed" (0.0). Plus a depth/stability test.
* **Pillar 2** – Adversarial manipulation-resistance: extended the single-shot `AdversarialTrader` into a sustained, target-seeking pusher; ran a 2D frontier (informed fraction x adversary budget) of who wins; restoration metrics repointed to p_informed; a fixed-b variant built as an *instrument* to de-entangle cost from b-runaway.
* **Pillar 3** – Substrate Neutrality: zero-informed (pure-agent) test for directional drift + graceful-degredation test.
* **Pillar 4** – Robustness: multi-seed % CI bands (idiom attributed from compute_ci_band, reimplemented not vendored – the source was truth-coupled) + a numpy-only bootstrap A/B comparator. Plus realistic dispersion and widened-budget cuts.
* Vendored with provenance: `metrics.py`, `adversarial.py` (verbatim, repointed to `p_informed`). New dep: `pandas` (pulled in by the vendored convergence_tick; flagged, pinned). Committed: 15 files, private repo, data/ gitignored (artifacts regenerate from seed).

##### Discovered:

* Pivotality threshold is ~2-5% under a near-perfect signal – but this is a FLOOR, not the headline. At realistic expert disagreement (σ = 0.10) the CI bands widen sharply – pivotal in expectation, but a tight per-instance guarantee needs a larger cohort.
* The adversary genuinely wins in the unlimited-capital + tiny-informed corner – proving the test isn't rigged toward the defender
* Cost-to-Manipulate is LOW. The fixed-b instrument showed net cost-to-hold is only ~$154-$483; the adversary holds *fair-valued inventory*, so the real barrier is gross capital (~$8.5k), not a loss they absorb.
