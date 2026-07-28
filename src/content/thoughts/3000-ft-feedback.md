---
title: 3000 ft; feedback
topic: Martingale
date: 2026-07-25T17:07:00
---
might be better to sell this sort of hedging / financial product to a party that's less financially sophisticated (i.e., biotechs) rather than efficient market participants like a crossover / royalty / credit desk.

we already know hedgers pay above fair price (SUPPOSEDLY, NOT VALIDATED), the warehouse gets paid out of that flow, so we want counterparties whose willingness to pay is HIGHEST.

a biotech hedging its own readout is the maximally informed trader in that market. the sponsor holds interim looks before anyone else. Warehouse needs to measure adverse selection from KYC'd flow.

**I still think we should stay away from sponsor self-hedging.** MNPI (contracts settle on a fact about which the company has MNPI access); Signaling (public company buying a failure protection on its own trial is likely disclosable, and the disclosure itself moves p and the stock); Sales Cycle (corporate treasury + board + auditors + hedge accounting takes a long time, royalty/credit desks can do the trade in weeks)

Will's feedback: institutional desks are efficient participants, minimal alpha to gain from even more portfolio hedging.

**Counter:** royalty funds holding a stream on a drug facing a PDUFA date as concentrated, unhedgeable, mandate-constrained exposure. they pay above fair for reasons unrelated to information: mark-to-market, LP optics, concentration limits. 

*how do you know they want to hedge?*

can't assume ... CMS was proof. materiality test exists to detect the absence of hedging demand, and in managed care if failed: the event class barely moves the equities, rms ratio 1.16 R^2 near zero, so we concluded no hedger exists and moved on from the sector.

*does the demand exist?*

S&T showed that demand often meets lack of supply (i.e., contracts can't find buyers). royalty and credits have exposures they can't shed through any existing instrument, held under mark-to-market and concentration constraints that make shedding it valuable.

*how can we prove depth?*

**crossing sim –** computes whether the hedger's reservation price exceeds the MM's break-event quote anywhere in parameter space, with a thorough sweep. CMS returned 'no' at every alpha and every X, and the structural audit showed us that no single-market contract crosses under the current mechanics.

next steps for the sim – run the corrected harness, with the A.2 φ² convention and the netting treatment resolved, on the CAPR/REPL cross-section. it also bears on our open pre-registration decision. we could pre-register on the crossing itself, stated as a demand-depth claim (some pre-committed fraction of cells must cross at measured X and measured E\[(Δp)²] for the sector to count as viable.

*what price would we quote & what makes it trustable?*

the quote is the anchor price (p) + a spread

anchor comes from Layer 1 (subsidized LS-LMSR whose cost of manipulation is bounded and whose maker-loss bound is machine-proved, running on-chain where the hedger's own risk team can verify the mechanism instead of trusting a counterparty's market.

spread is negotiated and explainable: a charge for adverse selection priced from the measured informed share (X) + a jump-risk premium sized to E\[(Δp)²] and reduced by the warehouse's diversification across near-independent readouts.







## july 28, 2026

pre-registration & configuration freeze, then contract expansion. goal is to answer William & Usman's concerns about demand depth.

1. write the pre-registration document. pre-commit a fraction of cells that must cross at measured X and measured E\[(Δp)²] for the sector to count as viable, and pin which cells are in scope (α band, N range, whether N > 1 cells count given the internal-contradiction finding that no single-market contract crosses under current mechanics
