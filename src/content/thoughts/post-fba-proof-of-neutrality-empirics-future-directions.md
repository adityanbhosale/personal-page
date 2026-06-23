---
title: post-FBA/proof-of-neutrality empirics; future directions
topic: ATS structures
date: 2026-06-22T23:42:00
---
Thin token makers are severely bled (-5.5 --> -24.5¢, 100% negative, deepen with greater horizon – ∆2 --> ∆30). These LPs are economically small in dollar figures only because the markets they act on are themselves quite shallow.

In a thicker market, adverse selection is a transfer from LP to informed trader – a cost, what my initial thesis was focused on preventing. 

In the tail market cases I'm now considering – pure-information markets with little uninformed hedging flow – Milgrom-Stokey applies: with common priors and no liquidity motive, rational traders won't trade, because every counterparty is trying to pick you off. These markets can't form under a CLOB at all. They can only exist if someone is willing to lose money to buy information – i.e., a *subsidizer* (that's what LS-LMSR is and was designed for).

Here, the adverse selection isn't extraction to be minimized – it's the **sponsor purchasing information aggregation**. The informed trader bleeding the market maker is doing the sponsor a favor: revealing their private signal into the price the sponsor is paying to discover.

So, the neutrality/anti-extraction frame inverts. The tail thesis isn't "minimize adverse selection." It's "maximize information revealed per subsidy dollar."

#### **Potential Directions Based on this Framing:** market formation for the *sponsored tail*

1. Markout-adaptive liquidity – my monitor becomes a control signal, not a sales tool. LS-LMSR's open problem is that it ties the liquidity parameter `b` to *volume*, but volume ≠ inforamtion – markets can have high uninformed churn or low informed trade, and b-on-volume can't tell the two apart (it also breaks the proper-scoring-rule property and lets prices sum > 1).

   * Markout is a live estimate of how informed the flow actually is. An AMM whose liquidity adapts to a realtime adverse-selection signal – tightening for uninformed flow, repricing depth when markout goes persistently negative – could be a new primitive.
   * The monitor I've just launched could help measure that input. This is the cleanest way my measurement work could survive the negative result – acting as a sensor in a loop.
2. Subsidy-optimal scoring-rule selection, made verifiable on-chain.

   * we could reframe the design object: *given budget B, choose the cost-function market maker that maximizes mutual information between final price and outcome.*

     * *i.e., Abernethy-Frongillo's framework, which unifies scoring rules and convex cost functions*
   * A sponsor would specify that they have "$X" and want the most informative price on outcome "Y", and get an optimally-parameterized AMM.
   * Crypto primitives aforementioned would be particularly useful,  unlike batch-clearing where the zk-proof was solution hunting for a problem.
3. Resolution cost as the real bottleneck.

   * the on-chain LMSR attempts (Augur, Gnosis/Omen) didn't die on the liquidity primitive – they died on resolution, gas, and UX. The marginal cost of trustworthy resolution does not scale down to micro-markets; UMA/Kleros don't get you to per-market cost ~ 0.
   * Could create a settlement-layer mechanism – amortized/batch disputes, or markets that resolve to their own pre-resolution price as a Schelling point unless bonded-disputed.

     * This is higher leverage than anything at the clearing layer.
4. Flow segmentation as mechanism design.

   * I personally find depth-on-uninformed-hedging-flow quite societally useless, but at the end of that day that's the flow that pays LPs – the two flow types simply require different mechanisms.

     * Hedgers want cheap immediacy (CLOB/CPMM is fine)
     * informed traders want a discovery mechanism whose price others believe
   * most venues run one mechanism for both. the defensible primitive here is the *router / self-selection mechanism* that sorts flow by information content and clears ecah on its own rail.



##### **The canonical instance of each:** the biotech milestone market

*No uninformed hedging flow, requires a subsidizing maker (potentially LS-LMSR), hard to resolve (scientific endpoint oracle), and – the part that closes the loop – the sponsor wants the information because the milestone probability re-prices the regulated security on my other layer (tokenized).*

The dual-layer architecture might not be unrelated – it could act as a worked example where the security layer *is* the sponsor with a quantifiable economic reason to fund information aggregation, and the price feeds back into asset valuation.

**Full thesis: information aggregation --> asset repricing --> more subsidy**





# Final Thesis:

verifiable, sponsored aggregation in a high-value vertical with an objective resolution & a closed loop to a regulated security
