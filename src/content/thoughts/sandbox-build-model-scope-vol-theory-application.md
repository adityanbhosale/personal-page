---
title: "sandbox build: model scope & VOL THEORY APPLICATION"
topic: VSA Markets
date: 2026-07-12T22:12:00
---
**S&T / ex-MM/derivatives trader feedback:**

S&T claims that natural two-sided flow doesn't exist for bespoke catalyst binaries;

Usman claimed that liquidity can be a *paid risk warehouse* quoting a diversified book of uncorrelated events, per-market risk scaling as `σ·√(ρ+(1−ρ)/N)`.



Informed flow will inevitably concentrate on the highest-edge readouts (effective p rises in highly-informed markets), and the hedgeability gradient means LP-viable markets will initially favor  names with tradeable correlates (i.e., relatively liquid options markets).



#### Weekend Derivatives Report – leerink S&T

**Trade of the Week (thesis):** VERA into the July 7 PDUFA; they sold the August 40 put / 45 call strangle for $8.30 – \~20% of the spot – FDA approved Trutakna, stock pinned, and the strangle decayed to \~$5.

* *the possibility of a tail event makes options overvalued relative to the modal outcome.*
* held a 2-dimensional view: high P(approval) and small E\[∆stock | approval]

  * only instrument to express that view was selling the entire equity vol surface, which bundles catalyst probability, the conditional move, and every unrelated thing happening to VERA stock.
  * **they got paid for warehousing a tail they didn't want**

**XBI unwind:** Anyone holding a correct catalyst view in single names gets run over by sector beta in unwind weeks.

* this is the value prop for "trade the readout, not the company"

Counter Argument: this is also the issue with a synthetic p in the warehouse-LP model I proposed.

* a book of uncorrelated catalyst events can have their idiosyncratic risk get correlated away by a sector move.



**Structures Being Traded:** Strangles (VERA, BMY, TARS), put spreads (RARE, CAPR), a 1x2 call spread (OCUL) – these are magnitude bets not directional bets.

* Analogous to the stradle/variance core the vol-theory work identified as the proper launch instrument on p (`E[(∆p)^2]`), rather than a continuous-strike surface.
* This tells us that S&T desks DO trade magnitude.



**Liquidity Shape:** Unusual Volumes table tells us that RARE puts 18,920 against a 1,792 average (\~10x), CAPR puts 10,504 against 838 (\~12x), VERA calls 14,434 against 1,160 (~12x).

* Biotech options liquidity is **episodic –** materializes around catalysts and evaporates in between.
* No natural continuous two-sided flow (adam was right ...); but real concentrated demand at events that a **paid warehouse** could serve (usman is also right).
* Note: every name here has a listed option, this is the hedgeable, LP-viable part of the market. Optionless small-caps don't appear in this sort of desk report.



**Hard-Date vs. Soft-Date:** document splits cleanly into hard-date catalysts (AdCom, PDUFA, CRL, etc.,) and soft-date readouts (KPTI "any time now"; SLS triggered by an 80th event, IMCR "as early as 2H26 ... could slip into 2027"; "back half of the year").

* VSA's magnitude-first framing (known date, size of the revision is not) holds for PDUFAs and AdComs, **fails for trial readouts where timing is uncertain**.
* Funding-tethered perps, settlement trigger, and OOv3 assertion all assume a known resolution date.
* *the first pilot markets should be a PDUFA or an AdCom, not a data readout.*

**Deferred Options Surface & Rationale:**

* Price discovery ≠ Liquidity. LS-LMSR can manufacture a price (anchor p) with no counterparty needed.
* Liquidity is a separate problem: someone needs to be willing to take both sides of the market. Subsidized makers can quote, not produce a deep two-sided book.



Options products will not inherently solve the liquidity problem – they just add the ability to express vol views.

A true liquidity solution would be a 'warehouse LP' – one paid risk desk quoting a diversified book of uncorrelated catalysts, risk diluting with the equation above. This acts on top of the subsidy.

The `observability-harness` (Dev-Task 1) being built for the sandbox model measures adverse selection (markout, maker-PnL). A/S is the LP's theoretical cost for providing the deep liquidity.



**Problem:** *Biotech catalysts have information worth trading but not nearly enough liquidity – niche, hard to hedge, wide spreads (making options markets very inefficient), and few people willing to take leveraged binary exposure.*

**Solution:** *An event-contract based synthetic market – subsidized LMSR anchor (p) for price discovery + a funding-tethered perp so traders can express views without a matched counterparty – instrumented so every trade measures both the informed share & the adverse-selection cost a warehouse LP would bear.*

**Missing:** liquidity solution. The perp + subsidy make trading feasible, but whether a warehouse LP is profitable is an open question (but HFT MMs are smart, they'll find a way to profit).





**Why Perps:**

* Perps allow people to express the following;

  * Directional level: "market's *p* is wrong" – go long if you think the true prob is higher, short if lower.
  * Magnitude of belief revision at the catalyst: hold into the readout to bet on how far p jumps when data drops
  * Timing / path views "p drifts up before the readout"
  * Relative value across catalysts: long one program's perp, short another's – express "drug A most likely than drug B" or pair correlated names
  * Funding carry: if you think the perp will trade persistently rich / cheap to p, harvest (or pay) the funding – a view on the basis itself, not the outcome.
  * Leverage on any of the above: perp lets you size the exposure up, which is the "expression conviction" point
* Perp's cannot express the following:

  * Convexity / non-linear payoffs
  * Pure volatility, direction-agnostic (requires variance instrument like an option)
  * Skew / tail shape (requires variance instrument like an option)



## Applying Vol Theory to VSA

We're essentially manufacturing a synthetic market: creating tradeable exposure to something – the probability of a catalyst, and specifically *how variable p is at the readout* – that doesn't cleanly trade on its own.

A variance swap is similarly synthesized from a basket of options; the VIX is a synthetic index that exists only because someone worked out its replicating portfolio.

VSA is manufacturing exposure to movement by replication on a synthetic underlying (p) instead of a listed stock or option.



**Biotech derivatives markets are inefficient:** vol theory's replication process for manufactured variance/vol exposure if based on log contracts, VIX, etc. – all of which assume the underlying is a continuous diffusion with returns INDEPENDENT of vol.

Biotech catalysts violate both:

* discrete jump at a scheduled date
* bundled into an equity that's also moving on cash, pipeline, & macro



That's what existing off-the-shelf financial instruments can't manufacture clean, isolated catalyst exposure (and liquidity issues).



## Applying Vol-Theory / Liquidity-Framing

We now know why standard variance-swaps fail on a synthetic event contract *p*, (discontinuous, step-wise @ resolution; bounded \[0,1]; at a binary resolution, the size of the move and the level are mechanically linked).



## Sandbox Build Sequencing Friday Jul 10

Open the catalyst + participant track (huge gate); build #3 invariant (a) (proving it's bounded-safe); and verify the L1 maker on BaseScan to inspect the contract itself.

Then, I'll work on dev-task #4 (ABM Pilot-Config), which tunes the parameters for dev-task #5 (deploying the perps layer), which unblocks dev-task #3 (invariant b) + #1's κ/mark-anchor full runs.

Lastly, the convergence of all parts of the mode will yield 'measured-X' if and only if the catalyst-and-participant rail has been built by the time the stack is live.

*The engineering work will produce a runnable, observable, fund-safe pilot model; the parallel rail produces the real catalyst and participants.*





#### **Invariant (a):**

Caveat: The traditional LMSR bounded-loss result states that `worst_case_loss ≤ maxLossBound = 6.9315 USDC`, and 6.9315 = b • ln(2). That's already a proven feature. What hasn't been proven is an **implementation property**.

1. The contract runs on fixed-point math (PRBMath UD60x18, per the constructor's args), and fixed-point exp/ln round.

   * *Does the rounded on-chain implementation still respect the maxLossBound, in the worst-case rounding direction.*
2. b = α·Σq *grows* with volume since this is Liquidity Sensitive LMSR, so fixed 6.9315 bound doesn't necessarily survive growing liquidity constant. Since my previous monitor result hit max worst-case loss of ~97.4%, there may be an adversarial LS-LMSR sequence that pushes the fixed bound past 100%, in which case the invariant is false as stated.



##### **Confirmed L1 Maker on BaseScan via Etherscan API Key DONE**



##### **Catalyst + Participant Work: PENDING**

#### **Dev-Task #5 –** bringing k/mark-anchor modules online to deploy a funding-tethered perp (linear, not inherently leveraged on p)

Settlement–Jump Problem: proposed perp is written on top of a bounded p that jumps to {0,1} at resolution. This complicates collateralization.

* long at p (1 unit notional) whose collateral covers the worst adverse move (to 0), **posts exactly p**. At resolution, it pays (1-p) if YES, (-1) if NO. That's analogous to buying a YES token at p.

  * A fully-jump-collateralized perp is just the spot token.
* Leverage through a terminal binary jump creates guaranteed bad debt. Any long at p with L > 1/p (or short with L > 1/(1-p) is out of the money as soon as the resolution happens.
* At p = 0.5, that caps the buyer at 2x leverage.



Potential Solutions:

1. **Deleveraging Window –** leverage permitted during the pre-readout drift, then forced ratchet to full jump-coverage (or close) at T - delta.

   * this would eliminate settlement bad debt and preserve the bounded-loss invariant.
   * cot: no levered position through the readout. Traders can still hold through it – at 1x leverage, i.e., spot equivalent. So the levered trade becomes "ride the pre-readout repricing and exit," which is somewhat valuable but a smaller edge for a PDUFA (where most of the revision lands at the announcement) than for a readout with interim news.
2. **Underwriting Fund –** accept settlement bad debt, backstop it. *this is the unhedgeable-jump-risk-to-resolution* that the vol-theory work said the warehouse LP must be paid an underwriting premium to hold; the insurance fund HERE is the warehouse.

   * cost: introduces unbounded loss, which contradicts the fund-safety story that is currently our strongest claim
3. **Position dependent margin –** `margin = notional x distance-to-adverse-boundary`
4. **underwriter?**

   * undewriting fund makes the warehouse-LP thesis more conrete, on-chain, & measurable.
   * seed F from the protocol in the pilot (testnet funds, so the capital cost is fake – but FLAG that, because the real money version needs a real subsidized underwriter.
   * essentially, settlement leverage cannot be manufactured, only UNDERWRITTEN.

     * for a winner to receive more than the loser posted, someone must over-collateralize relative to their own risk – an underwriting – warehouse LP who holds unhedgeable jump risk to resolution and must be paid an underwriting premium (as opposed to the variance dealer, who clips a spread between cancelling legs.



## Task #5 – layer 2 perp.

**Clarifications:**

1. *Second Moment of the Move* | `E[(Δp)²]`

   * p is today's anchor (the market's probability, i.e., 0.40. At the readout, p jumps to some resolved value p_post. 
   * We can define the move currently as `∆p = p_post – p`.
   * The move is a random variable today, but two facts can  better define it.

     * **A:** The first moment is **zero**. p is a martingale, so `E[Δp] = 0` by construction. The market's current price is *already* its best forecast of tomorrow's price; if `E[∆p]` were positive, p would just be wrong today and would have moved. So the first moment (the mean) carries no information – it's zero for every catalyst, always. Nothing to trade on.
     * **B:** Second moment is **not zero**. The second moment is the expected *squared* move.

       * E\[(Δp)²] = E\[(p_post − p)²]
     * Squaring does 2 things: it gets rid of the sign – a move from 0.40 to 0.90 and a move from 0.40 down to 0.05 both contribute positively – so it measures magnitude not direction.
     * Since the mean is 0, E\[(Δp)²] is the **variance of the belief revision:**

       * Var(∆p) = E\[(Δp)²] − (E\[Δp])² = E\[(Δp)²]
     * The second moment and variance are the same value.
   * **Synthesis:** *how big a surprise is the readout going to be?* Two catalysts can both sit at p = 0.40 and have different E\[(Δp)²]. A binary FDA approval that resolves hard to \~0 or \~1 has a huge second moment. A readout that will merely nudge p to 0.35 or 0.45 – an ambiguous interim, a modest efficacy signal – has a small one. The anchor p tells you nothing about which. That's the dimension a binary structurally cannot express and it's essentially the value of the options layer.
2. *Leverage is a no-op at binary settlement"*

   * Two traders take opposite sides of one contract on p. Unlevered (L = 1), this is just the spot binary: the long pays p, the short pays 1 – p, together they find the 1 that the winner collects. Now apply leverage L symmetrically – both sides post 1/L of what they'd post unlevered:

     * long posts p/L
     * short posts (1-p)/L
     * total pot: p/L + (1-p)/L = 1/L
   * At resolution, YES: the long takes the whole pot (1/L returned on a stake of p/L – a return multiple of (1 / L) + (p / L) = 1 / p.
   * Let's compare that to a spot, unlevered: pay p, receive 1 --> multiple 1/p. Identical. The L cancels – it's in both 

Leverage is a no-op at binary settlement in a zero-sum book. Symmetric leverage L: long posts p/L, short posts (1-p)/L, pot is 1/L. winner takes the pot --> return multiple 1/p – same as the spot multiple.



**Build Summary: VSAPerp, full session**

Design Reframe:

* established that leverage is a no-op at binary settlement in a zero-sum book: long posts p/L, short posts (1-p)/L, pot is 1/L –> winner's return multiple is 1/p, exactly the spot multiple. Leverage cancels.
* Thus, **settlement leverage cannot be manufactured, only underwritten** –> an underwriting fund F is required, which is the on-chain instantiation of the vol-theory "warehouse LP" holding unhedgeable jump risk to resolution.
* Funding IS the underwriting premium – the crowded side pays F continuously for holding the jump. The tether does double duty: anchor primacy (Layer 1 stays the reference) + paying the warehouse.
* Named the instrument honestly: **a dated future with a funding tether**, not a true perp (it settles).
* Wrote the design doc: contract surface, mark mechanism, event schema, settlement path, 4-phase plan.



**Phase 1:** fund-safety invariant (committed: d2f47d5)
