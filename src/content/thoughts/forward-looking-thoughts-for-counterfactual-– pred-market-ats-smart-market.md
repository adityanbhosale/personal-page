---
title: forward looking thoughts for counterfactual – pred market ATS smart market?
topic: ATS structures
date: 2026-06-09T16:06:00
---
Thoughts on building an ATS Smart Market for event contracts / on-chain markets, since institutional markets (equities / FX) are dominated by incumbent ATS (i.e., OneChronos).

Caveats to building an ATS Smart Market – easy to build a matching engine (optimization-based auction; commoditized) – moat is regulatory licensure (SEC reg., broker-dealer status, FINRA, Form ATS-N), liquidity network effects (empty venue is worthless, and it's hard to bootstrap two-sided institutional flow from my desk), institutional trust and track record, connectivity system (FIX gateways, OMS/EMS integration, broker routers). These things structurally favor incumbents.

Really, I need to swap the mechanism / participant-side approach to market structure to solving a problem that I care about. *Whose pain is acute enough that they'd route flow to me, switch venues, or adopt to my system?*

Since equities / FX are dominated by existing ATS, might be worth exploring event contracts / on-chain markets for two reasons: there's no entrenched smart-market incumbent there, and one-chain settlement changes the substrate (may not need to be a registered US ATS at all; it's a different regulatory surface).

#### Logical Next Step – FBA-sim on hybrid orderbook repo



#### Other thoughts:

CoW Protocol settles batch auctions where orders are grouped into batches and auctioned to solvers who compete to find the best settlement, with the grouping itself enforcing enforcing rules that precent MEV. Thus, there are live, large-scale batch-auction surface that attract real flow by protecting it from extraction.

**The Bleeder:** whoever the current mechanism taxes

* Batch auctions help 2 parties, and hurt 1. 

  * They help the liquidity provider being sniped (the LP whose resting quote goes stale on news and gets picked off by faster capital before they can cancel their order – this is demonstrated by my Thesis B finding, where LP-edge markets show negative post-fill markout, i.e., market makers bleeding to adverse selection). 
  * They also help the taker getting extracted – front-run, sandwiched, or paying the latnecy tax baked into spreads.
  * They hurt the latency arbitrageur – whose entire edge is being fastest.
  * Thus the bleeders are LPs and extracted takers; enemy is fast arbitrageurs.

**The Switcher:** whoever has the pain and the agency to move flow and the ability to do it without needing everyone else to move first

* The professional market makers who isn't the fastest. Strong pain, real agency, and the mechanism is designed for their fail-point. The issue is a single MM moving to an empty venue doesn't yield necessary liquidity. They also follow liquidity, not create it. So, the **MM** is the **SECOND SWITCHER**.
* The flow originator – as shown by the CoW protocol. The party with pain && agency && the ability to move unilaterally IS NOT A TRADER; it's whoever owns or routes the order flow: a prediction-market frontend, a wallet, an aggregator, a Telegram trading bot, a "smart-money" copy-trading app – any surface where end-users initiate event-contract trades adn currently eat the extraction.

  * flow originators can move flow the instant they integrate, without waiting for a liquidity network to form, because in the CoW protocol you **don't run liquidity** – **solvers/MMs compete to fill the flow you bring.**The originator integrates one API; their users stop getting pitcked off; the originator can even capture surplus to share back. That rids the cold-start problem that kills the venue version of this: with a protocol or application integrates CoW, their users' traders become intents in the same batch auction, the same MEV protection and uniform clearing prices apply – which is what makes it useful as infrastructure, not just a consumer product.



**THUS:** the ideal user of an event-contract / on-chain market ATS smart market is whoever brings flows: a prediction-market / event-contract flow originator whose users are currently bleeding to extraction and stale-quote pickoff

* a frontend
* wallet
* trading-bot layer that sits on top of Polymarket-style on-chain markets
* anything that integrates my batch settlement layer so their users get protected, surplus-returning fills.

The end-bleeder (not switcher) is that flow originator's retail/semi-pro user losing the markout that I previously quantified.





*This is the protective settlement layer in front of existing flow, and MMs compete to fill it.*

* *single-sided wedge*
* *integrate one partners at a time*
* *no liquidity to bootstrap*



*The CoW model is the founder-tractable version of this idea, and it's the one whose local ideal user I can identify.*





***Caveats:***

* The on-chain event-market flow may be too small today. Polymarket is the whole game and its volume is spiky around big events; outside election season the addressable extraction might not support a business.

  * this is TAM issue, not mechanism
* Polymarket already runs its own off-chain CLOB and could batch internally or add protection themselves – the same "incumbent will built it" objection.

  * Defense: I sit *across* venues and frontends as neutral infrastructure, which a single venue won't do because it competes with the others.
  * Is that neutrality valuable?
* Spot-DeFi batch settlement is crowded (CoW, UniswapX, 1inch Fusion, dozens of intent protocols). My only defense is event-contract specialization – the fact that these markets have discrete resolution, news-driven stale-quote dynamics, and cross-venue fragmentation that generic spot solvers don't model.



**Bridge to the Build:** designing the FBA-sim arm to answer *this user's question* not a generic one.

* The flow originator needs to believe that routing its users' flow through a batch auction measurably reduces what they lose.
* Headline output of the simulator should be the **change in taker markout / extraction and LP adverse-selection markout under a CoW-style batched-solver venue vs. continuous CLOB & AMM baselines**, on event-contract shaped flow (with discrete resolution, news shocks, the stale-quote dynamics from my Part 1/2 work measured on *real* books).

  * I've built the empirical case a flow originator would need to integrate – and the single most on-thesis artifact I could build. The simulation becomes the proof-of-value for the named user, beyond a mechanism study.
