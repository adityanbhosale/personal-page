---
title: "on-chain build: Funding Mechanism for Perpetual Mark Tracking"
topic: VSA Markets
date: 2026-07-07T08:53:00
---
Dev Task 2 – Funding-Tether Control Loop (build as `funding_loop.py`  + 4 figures in the prior session):

* Perp mark m tethered to anchor p by periodic funding

  * `f = clamp(k • (m – p), ± f_max)` – discrete-time loop, basis `b = m – p`
* Result: clean convergence boundary (`k < 2/(N • k)`

  * N = funding interval
  * k = demand elasticity
* Tradeoff: funding clock is the dominant lever
* Two failure modes: clamped funding saturates into a bounded limit-cycle (not divergence); and persistent demand > k • f_max decouples the mark regardless of gain, so f_max sizes the max absorbable imbalance
* k is ASSUMED (a real-flow property, measured in pilot
* I'll add TWAP-basis variant before implementing in Solidity



The funding tether model already exists as `funding_loop.py.`

This is essentially the Layer 2 version of Gate A: *a parametric control-loop simulation that produces a stable-region map + figures, so the funding constants `(k, interval, f_max)` are pinned from evidence before the mechanism is committed to Solidity.*

Dependency Chain: #1 observability harness --> #2 this --> #3 invariant suite.

1. Observability Harness measures the empirical parameters k (demand elasticity) and X (informed share) that this loop assumes
2. Funding Tether produces the k • f_max decoupling threshold that the invariant suite's fund-safety invariants consume.





## Recap Dev-Task (Funding Mechanism for Perpetual Mark Tracking)

**Core Sim:** `funding_loop.py`

* Discrete-time control model: perp mark `m` tethered to anchor `p` via periodic funding `f = clamp(k • (m – p), ±f_max)`, zero-order hold, basis `b = m – p`. reconstructed from the handoff spec
* Deterministic (seeded), with `κ` exposed as a single ASSUMED input, plus configurable `f_max`, anchor, demand, and a `basis_mode` toggle (`instant` default / `twap`).
* Configurable output directory via `FUNDING_LOOP_OUT` so it works wherever the script sits (repo or results/), and a backward-compatible `anchor-path` addition (agent-patched, verified byte-identical when unused)
* Single entrypoint that regenerates every figure + the JSON in one run.



**Results (SIMULATED, with** κ **ASSUMED)**

* Constant-pinning rule: clean-convergence boundary k < 2 / (N • k) for the instant scheme
* Tracking tradeoff: steady-state basis b\* = d / (κK); the funding clock (interval N) is the dominant lever, not the gain (N = 1 --> k\*=2.0, \~0.15pp error, N = 8 --> k\* = 0.25, \~1.2-1.4pp; N = 32 --> k\* = 0.0625, ~4.9pp / "no clean gain").
* Failure mode 1: the funding clamp turns excess gain into a bounded limit cycle (~8pp at N = 8 over-gain), not divergence.
* Failure mode 2: persistent demand > κ • f_max decouples the mark regardless of gain, so f_max sizes the max absorbable on-sided imbalance.



**TWAP extension – `twap_analysis.py`**

* Completed-window premium TWAP via a cumulative index
* re-derived boundary k < 2 / (N - 1) • κ (looser than instant by N / (N – 1)), validated three independent ways – closed-form, companion-matrix spectral radius, and simulation – agreeing to 3+ digits, and independently reconfirmed by my own spectral check
*
