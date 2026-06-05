---
title: nexus – private rooms (custom counterparty offering)
topic: ATS structures
date: 2026-06-05T19:24:00
---
A 'Nexus' (custom group) lets a subscriber or their client designate orders to interact only with a specified user or group – or only with their own orders – instead of the base environment



OneChronos creates it on request with written counterparty consent, and orders carry the NexusID.



On top of the Nexus is an Omnimarket, which spans multiple Nexuses and the order executes whichever Nexus(es) best match API.

* fills can span Nexuses at distinct prices, with ties broken randomly
* An order can try its Nexus first, then expose residual quantity to the base environment within the same auction cycle, repeating every cycle of its life





#### Bridge to prediction market auction-theory work I've done

Nexus is the *on-venue* answer to the off-book migration I wrote about in the 'future directions' post. Thesis #3 was that arbitrage gradually migrates off-book

* institutional flow exits the public book via FCM membership, blocks, OTC desks

In equities, the same demand exists (curated counterparties, bilateral trust, private rooms) – and OneChronos's approach seems to be internalizing that demand *inside the auction mechanism* rather than losing it to bilateral OTC.
