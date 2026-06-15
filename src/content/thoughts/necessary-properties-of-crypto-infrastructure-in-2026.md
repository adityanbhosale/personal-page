---
title: necessary properties of crypto infrastructure in 2026
topic: ATS structures
date: 2026-06-14T20:31:00
---
1. Verifiable Contracts – agreements whose correct execution anyone can check cryptographically, so you can trust the math rather than trusting a counterparty or intermediary to honor the deal.
2. Neutral Markets – venues where no participant gets a structural edge baked into the mechanism (no privileged access, no rent extracted by being faster to deploy capital, or by gatekeeping), so the rules apply equally to everyone.
3. Trustless Systems – systems whose correctness is guaranteed by design (cryptography, consensus) rather than by trusting the operator, so you don't have to believe anyone is honest for the system to work properly.



**1 & 3 already have a strong primitive base – the foundational technologies that *make* verifiability and trustlessness real.**

*(i.e., Fully Homomorphic Encryption that lets a computer run computations directly on encrypted data and return an encrypted results, without ever decrypting it so a server can process data without seeing it; Zero Knowledge Proofs letting one party prove a statement is true without revealing the underlying data; Decentralized Compute fostering networks that coordinate distributed machines to train or run models and do general computation without routing through a single cloud provider so you get compute without surrendering control to any hyperscaler; Crypto-native identity allowing for portable, user-controlled identity and credentials that live with the user rather than inside a platform's database so users own their identity and data across apps instead of re-creating it inside each walled garden)*



**Missing primitives under property 2 – neutral markets:** *neutral matching for AI-agent prone markets; neutral settlement rails for on-chain event markets; verifiable execution-quality infrastructure; pre-trade privacy for agentic order flow.*



Neutral Matching and Batch-Settlement Rails both rely on the claim that batch clearing measurably reduces extraction versus continuous matching on event-contract flow. The mechanical counterfactual batched settlement limitation proves the rent exists, but **doesn't prove that batching removes rent under endogenous behavior.**

Integrating the FBA auction acts as a gate to building the matching primitive – tells us whether batching helps, at what pi, at what immediacy cost, and for whom. If the pi-curve returns flat, batching doesn't help on event flow.
