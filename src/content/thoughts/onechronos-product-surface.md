---
title: OneChronos product surface
topic: ATS structures
date: 2026-06-05T15:05:00
---
OneChronos operates a dark U.S. equities ATs that hosts auctions on average 10-20 times a second throughout the trading day, matching orders independently of when they arrive – *time-randomized periodic auctions designed to reduce gamability of markets.*

Mechanically: rather than matching continuously (i.e. as is done in a continuous CLOB), it periodically holds multilateral auctions seeking an optimal match (via novel solve algorithm) across all eligible orders, with each auction's cuttoff time (release time) drawn at random 20-200ms after the previous one.

Match Priority is based ion aggregate notional price improvement, & all matches clear within the NBBO at a single price per symbol; full non-displayed, no data feeds, firm orders only.

Smart Market – combinatorial auction techniques (2020 Economics Nobel) + AI, running at a speed and scale that wasn't previously possible.

\----------------

OneChronos is essentially operated a production version of the batch-based markets I theorized for prediction markets. The time-randomized + network buffer is the answer to the tension I was thinking about (race-resistant vs. responsive tradeoff).

\----------------

US. Equities product surface – Expressive Bidding, Conditionals, Nexus

Newer product surfaces: a spot FX venue brining the optimization-based auction model to currencies + European Equities.
