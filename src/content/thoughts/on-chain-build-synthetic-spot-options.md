---
title: "on-chain build: synthetic spot + options"
topic: VSA Markets
date: 2026-06-30T14:17:00
---
A subsidized harvest market maker that manufactures a continuous catalyst \*\*probability p\*\* (Layer 1 – synthetic spot), and a derivatives layer (perps/options on 'p') that funding-anchors to it (Layer 2). It inventories all relevant prior engineering and design work, states what is validated vs assumed vs unbuilt, specifies the target architecture, and lays out a phased, audit-first build plan with the security gate that must not be skipped.

**Manipulation-surface gate:** Layer 2 must not be deployed against a live Layer 1 until the manipulation-resistance result is re-derived with the derivatives incentive added. Everything else is sequenced around that.
