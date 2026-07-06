---
title: "on-chain build: perps/options layer 2"
topic: VSA Markets
date: 2026-07-04T15:19:00
---
Buliding everything as a function of (X, L) so any validated inputs act as plug-in values.

Other input – α – Layer 1 AMM subsidy / max-loss provision

## 1. Gate A as a Surface of Attack-Payoff

Simulation that produces P(∆, X, L, α, N) = L • N • realized_excursion(∆, X) – C(∆, α) – funding_rate – informed_arb(X).

Goal: max over (∆, N) of P < 0.



#### 1A: Build `run_surface.py` in Gate A repo.

Defines the attacker payoff P(∆, X, L, subsidy amount, N) = L • N • realized_excursion(∆, X) – C(∆, subsidy-amount) – informed_arb(X).

Funding term is dropped.

Solving for inner-max via grid-search over (∆, N) – not a first-order condition; max P is likely non-concave (C convex in ∆, but realized_excursion may saturate).



**Grid Ranges:**

L ∈ {1, 2, 3, 5, 10, 15, 20, 25} — covers the 3×/10×/25× talking points.

 X ∈ \[0.10, 0.50], step 0.02 — brackets measured-13% to assumed-40%.

α from 1× to 10× the live Layer-1 subsidy. Live α ≈ 5.0 USDC (from maxLossBound = 6.93 = 2·α·ln2) — read the actual value from the Layer-1 config/deployment rather than hardcoding, then sweep multiples of it. This is the "how much over-subsidy holds the line" axis.

Inner (Δ, N): pick reasonable ranges for push-magnitude Δ and trade-count N, but state them explicitly and remember boundary argmaxes get flagged per above.



**Findings:** assumptions_manifest.json as well as surface.json C(∆, subsidy-amount) and informed_arb(X) as ASSUMED functional values.



**Diagnostic 1 – Is X a turnkey sweep parameter. YES**

X (informed share) is a direct function argument, not a hardcoded grid. harness.win_at_fraction(sigma, L, horn, frac) and capture.mean_win(sigma, frac, L, horn) both take frac and compute n_informed = max(1, round(frac·200)). The FRACTIONS list is only consulted by theta_star's scan; the win/excursion calls bypass it. Verified live: ran X=0.30 cleanly. X ∈ \[0.10, 0.50] step 0.02 → n_informed ∈ {20, 24, …, 100}, all exact integers (200-agent population, 0.005 granularity). Turnkey.



**Diagnostic 2 – Does the harness emit excursion, or only PnL? YES EXCURSION AVAILABLE**

It emits MORE than win/loss. Live run at (sigma = 0.10, X = 0.30, L = 1, MARK):

* captured mark = 0.7782 --> excursion vs fair (p_informed = 0.75) = +0.0282 in price space
* adv_net_cost = 15064.5 (realized cost-to-manipulate, from contest_cel)
* informed_win = 0.8985 (continuous restoration score, not binary)





## Recap:

* build run_surface.py – attack-payoff surface engine producing X\*(L) break-even point and L\*(X, budget) critical-leverage curves
* Payoff P with funding dropped, inner max grid-searched over the attacker's controls with per-cell argmax logging and corner-solution flagging
* didn't touch Gate A pass criteria
* net-new artifacts provenance-stamped and labeled simulated-not-observed; assumptions_manifest.json fences the assumed terms (C, informed_arb).
