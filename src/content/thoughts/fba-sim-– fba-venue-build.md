---
title: FBA sim – FBA venue build
topic: ATS structures
date: 2026-06-10T17:11:00
---
The FBA venue must be a resting limit book cleared by a periodic unfirm-price call auction every pi ticks – this is traditional from Budish et al.

Limit orders rests across batches till filled or cancelled (since that's how LPs provide the depth); market orders are single-batch and expire if there's no opposite interest that clear.

*Prediction and event-contract markets are moving on-chain and are about to traded primarily by autonomous agents, not humans. The mechanisms they run today (i.e., continuous central-limit orderbooks & automated market makers) reproduce the exact latency race and adverse-selection pathologies that broke equity markets and FX markets back in 2010.*

#### State & Cadence:

* Constructor takes tau_ticks: int (clear interval) plus whatever case Venue needs. Maintain a resting limit book (reuse the CLOB's book structures – will not invent a new price type.
* tick() increments an internal counter; when (counter % tau_ticks == 0), run a clear. Orders submitted during [last_clear, this_cleear) participant inb this clear. The sweep already fires venue.tick() at priority -50 before signals/decisions/trades, so submits at step t land in t+1's clear - rely on that, don't add a scheduler.



#### Submit Semantics (deferred)

* submit_limit_order: add to resting book, return an OrderResult with filled_quantity=0, remaining_quantity=qty, a real order_Id ("acceted/pending" convention from Entry 1 dataclass). No synchronous fill.
* submit_market_order: queue as a market-side participant for the next clear.



#### Clearing Process (native reimpl of `batch_counterfactual/auction.py`)

* candidate prices are distinct resting / arriving \*\*limit\*\* prices (market orders participate at every price but define no candidates – with both F and S step functions breaking only at limit prices, interior volumes never exceed candidate columes, so scanning candidates finds the max).
