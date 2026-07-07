---
title: "on-chain build: observability/measurement harness"
topic: VSA Markets
date: 2026-07-07T17:43:00
---
From `polymarket-neutrality-monitor`, porting the substrate-neutral MarkoutEngine _ the offline aggregators.

Adding the Polymarket-replay adapter (regression) and the on-chain LS-LMSR adapter (live). Use the real marginal mid (priceYes()) as the markout reference on the on-chain side. Stub κ + mark-anchor with defined ingestion schemas against synthetic perp data (perp confirmed absent)



Quick note on numbering: the \*\*observability/measurement harness is dev-task #1\*\* (dev-task #2 was the funding-tether control loop, already shipped to gate-a \`main\`). Here's where the harness stands.



##### **\## Queried (§0 recon)**

\- \*\*Located the prototype\*\*: the Polymarket adverse-selection monitor is its \*\*own repo\*\* \`polymarket-neutrality-monitor\` (not inside \`kalshi-polymarket-microstructure\`). Core engine = \`monitor/markout.py\` (\`MarkoutEngine\`); offline aggregators = \`scripts/maker_distribution.py\` (the 40/109 producer) + \`volume_weighted.py\` + \`regime_verdict.py\`.

\- \*\*Pinned the exact frozen finding\*\* by running the original: from \`data/maker_markouts.jsonl\` (sha \`faf1cb4a…\`, 29,496 rows, gitignored), at Δ30 → \*\*40/108 negative-median makers, bimodal (29 \`<−1¢\` / 33 \`≥+1.5¢\`)\*\*; median-of-medians erodes +0.5→+0.25→+0.1¢ across Δ2/10/30.

\- Read the vsa-onchain data sources: \`LSLMSRMaker.sol\` (events + \`maxLossBound()\` view = 6.9315) and \`CatalystResolverOOv3.sol\` (\`Resolved\` outcome). Confirmed \*\*no perp/funding contract exists\*\* → κ and mark-anchor stay stubbed.



##### **\## Built (new repo \`vsa-observability\`, no commits — audit-first)**

\- \*\*Phase 1\*\*: ported the substrate-neutral \`MarkoutEngine\` + aggregators; a \*\*Polymarket-replay adapter\*\* (regression) and an \*\*on-chain LS-LMSR adapter\*\* using the real \`priceYes()\` marginal mid; \`MEASURED-MAINNET\` added as a third fencing tier vs \`MEASURED-ON-TESTNET\`; vendored the frozen snapshot + \`VENDORED.md\`. The \*\*40/109 regression reproduces every frozen number byte-for-byte\*\*; a self-check runs the on-chain engine (informed flow → maker −2.0¢) and the κ/mark-anchor stubs. Byte-reproducibility proven.

\- \*\*Phase 2 (in progress — the X estimator §3 + recovery test §4)\*\*: \`observ/abm.py\` (ground-truth generator with five confounds — luck/calibrated-flippers, markout-decorr, capital-decorr, participation-selection, edge-erosion); \`observ/xestimator.py\` (three separate readings — resolution-skill, markout-proxy, pivotality — each excess-over-null, \*\*not blended\*\*; aggregate-X prioritized; calibration \`CalibrationStub\` undefined-by-design until a catalyst series; per-participant labels \*\*withheld\*\* behind a binomial+FDR bar); κ estimator retrofit with a real CI + process-noise/OVB confound.

\- The \*\*non-trivial recovery test just passed all three required criteria\*\*: C1 monotonic degradation (e.g. X=0.5 RMSE 0.019→0.196→0.364→0.491 as confound intensity rises), C2 interval calibration (\~0.87–0.90 coverage at λ=0 vs 0.90 nominal), C3 null rejection (X=0 → X̂≈0.008, detect-rate \~5%); κ retrofit R²=0.777 (not perfect), CI \[0.868, 1.101] covers true κ=1, and omitting demand demonstrably biases κ.



##### **\## Planned / not yet done**

\- Clean up the numpy \`matmul\` RuntimeWarnings surfacing in the κ retrofit (likely the omitted-demand OLS path); update \`RESULTS.md\` to show the recovery grid + criteria; prove byte-reproducibility of \`recovery_test.json\`.

\- \*\*Then stop\*\* — before any real/pilot numbers — per the instruction to settle X-estimator method-weighting first.

\- Still deferred downstream: the X estimator on real data, the maker-P&L-vs-6.9315 monitor, full κ + mark-anchor runs (gated on the task-#5 perp), and the #1↔#4 ABM coupling.

\- Standing constraints: no commit/push, no pilot numbers, audit-first.







One numbering note first: in this project the \*\*observability/measurement harness is dev-task #1\*\* and the \*\*funding-tether control loop is dev-task #2\*\* — but your question is really about the \*coupling\* between the two, which is the important part, so I'll answer that directly (and it holds whichever label you use).



\## What the harness is \*for\*



The whole project rests on two behavioral parameters that \*\*can't be assumed honestly\*\* — they're properties of \*real\* order flow, not of code:



\- \*\*κ (demand elasticity)\*\* — how much the perp mark moves per unit of funding per tick. This is the parameter the funding-loop model is built on.

\- \*\*X (informed share)\*\* — the fraction of flow that is informed. Gate A's safety proof is \*conditional\* on this.



Both are ASSUMED in the design work. The harness exists to turn a pilot into \*\*evidence\*\*: it instruments every on-chain trade and \*measures\* κ and X (plus adverse selection, maker P&L vs the fund-safety bound, and mark-vs-anchor tracking) — producing the project's first numbers that are a real step up from ASSUMED. Its tagline is "turn every pilot trade into evidence," with strict fencing so a Base-Sepolia play-money pilot renders as \*\*MEASURED-ON-TESTNET\*\*, never with the weight of real-money data.



\## How it builds off the funding mechanism (the #1 ↔ #2 pairing)



The harness and the funding loop are described as "two halves of one thing." The funding loop \*assumes\* κ and outputs a stable-region map; the harness \*measures\* κ and feeds it back in:



\- \*\*#1 → #2 (measured κ closes the loop):\*\* the funding model's core result is the stability boundary \`k < 2/(N·κ)\`. That's only a \*curve in κ\* until κ has a number. The harness's κ estimator regresses per-interval mark change against realized funding (separating the endogenous funding-response from exogenous flow) to measure κ — and once measured, you read the deployed funding constants \`(k, interval, f_max)\` straight off the funding loop's Fig A.

\- \*\*Empirically testing #2's predictions:\*\* the harness's mark-vs-anchor module checks the \*realized\* basis against Fig B's tracking-error prediction at the deployed constants, and flags \*\*decoupling\*\* (failure mode 2) if persistent demand crosses the committed \*\*κ·f_max\*\* threshold — the exact quantity #2 exported.

\- \*\*Shared fund-safety bound:\*\* both read the same committed \`kappa_fmax_export.json\`, including the ON-CHAIN \`maxLossBound ≈ 6.9315 USDC\`. The harness's maker-P&L monitor is the live/empirical twin of that bound (and of #3's formal invariant).



There's a dependency direction worth being precise about: κ and the mark-anchor module are \*\*blocked on the perp actually existing\*\* (that's a later task — the perp/funding \*contract\* isn't built yet). So the harness defines the ingestion schema and estimator interfaces \*now\* and runs them against synthetic perp data, ready to run for real once the perp deploys. Meanwhile the parts that don't need the perp — the adverse-selection core (ported from the Polymarket monitor), the X estimator, and the recovery validation — are built and testable against Layer-1 data today.



So the relationship is a closed loop: the funding mechanism is a control law parameterized by κ and safe only under some X; the harness is the instrument that measures κ and X from live flow, pins the funding constants from evidence, and continuously checks that the deployed loop actually behaves the way #2's model predicted.
