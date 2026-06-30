---
title: "on-chain build: synthetic spot + options"
topic: VSA Markets
date: 2026-06-30T14:17:00
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
