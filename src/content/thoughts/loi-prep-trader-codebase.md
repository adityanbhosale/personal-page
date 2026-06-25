---
title: LOI prep / trader codebase
topic: VSA Markets
date: 2026-06-25T15:35:00
---
# Letters of Intent

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

   *  Run many markets at varied true_p, resolve ~Bernoulli(true_p), score price vs realized outcomes (Brier/reliability curve). This **can falsify** – it catches systematic miscalibration from LS-LMSr spread bias, finite-N signal-mean error, or maker skew – but **a pass is weak evidence** because price = true_p and outcome~Bernoulli(true_p) make calibration hold nearly by construction. Frame it as a **bias detector / falsification gate, not proof.**
