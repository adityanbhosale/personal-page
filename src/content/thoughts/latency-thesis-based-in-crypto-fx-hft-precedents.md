---
title: latency thesis based in crypto, FX, & HFT precedents
topic: kalshi-polymarket microstructure
date: 2026-06-02T17:26:00
---
#### Physical path in prediction-market latency arbitrage

Most content in this space exists in vendor blogs, repos, and a live latency-monitoring service, not academia/research. Academic rigor exists in adjacent domains – HFT equities, FX, etc. Doesn't seem to be any formal bridge to Kalshi/Polymarket.

#### hyperlatency.glassnode.com

exists to help traders decide where to co-locate. probes RTT worldwide to crypto exchanges, blockchain validators, oracle gateways, & prediction markets directly.

* publishes the server origins I'd otherwise have to reverse-engineer (i.e. PM's CLOB at clob.polymarket.com origins froms AWS eu-west-2 in London; Kalshi at api.elections.kalshi.com origins from AWE us-east-2 in Ohio)
* explains our calibration smoke test results – my machine measured Kalshi \~20ms / Polymarket \~95ms – and now I know why. Kalshi's servers in Ohio and PM in London. The ~38ms differential isn't noise, it's geography.
* co-loc problem is quite difficult to address

#### vendor ecosystem: VPS providers selling sub-millisecond proximity

definitely demand here. multiple providers sell prediction-market-specific VPS hosting, and their published numbers are concrete and consistent:

* from a US East Coast connection, round-trip latency to PM's CLOB averages \~130ms; from Dub it drops under 5ms; from Amsterdam, \~10ms
* a server in the same facility as PM's infra can reach at 1-5ms, versus 20-50ms for a VPS in the wrong region and 150ms+ for home internet. They cite Equinix LD4 in London at 0.56ms and NY4 in New York at 0.36ms as the co-location prime.
* one provider claimed under 0.5ms latency to PM's CLOB from a Dub VPS, marketing Dublin as the closest unrestricted location to PM's London AWS

**A Dublin or London cloud VM would collapse my PM RTT from ~95ms to single-digit.** However, it'd also increase Kalshi RTT due to geography trade off.

#### Market design caveat!

Latency-arb used to be real and large enough that the venue itself intervened. On Polymarket's zero-fee 15-minute crypto markets, bots monitored small delays between PM's internal pricing and spot prices on Binance/Coinbase, entering near 50/50 and exiting once prices converged – at least one wallet executed thousands of trades in a single month with high success rate.

PM introduced dynamic taker fees in early 2026 specifically to curb latency arb on 15-minute crypto markets.

dynamic taker fees then funded the maker rebates program – i.e., they taxed the latency takers to pay the liquidity providers, which is the market-design move predicted in Budish et al.

#### Adjacent Findings:

Budish, Cramton & Shin – "The High-Frequency Trading Arms Race" (QJE 2015)

Aquilina, Budish & O'Neill – "Quantifying the HFT Arms Race" (2020).

* CLOB is a flawed design: at high-frequency horizons, cross-market correlations break down, creating mechanical arb opps for whoever's fastest, and competition doesn't shrink the opportunities, it just raises the speed barrier needed to capture them
* empirical paper found latency-arb races are very frequent (about one per minute per symbol for FTSE 100 stocks), extremely fast (modal race 5-10 millionths of a second), account for substantial portion of trading volume, and are concentrated – the top 6 firms with 80% of races. each race is worth ~half a tick, but volume increases stakes

**Budish's proposed solution:** frequent batch auctions – discretize time so tiny speed advantages stop mattering. PM's 15-minute and 5-minute markets are already a crude form of time-discretization. So there's a novel research angle here – *do prediction markets' short-duration-binary structures function as accidental frequent-batch-auctions, and does that change the latency-arb dynamics versus a continuous CLOB?*

#### Infrastructure Approaches:

PTP hardware timestamping and kernel-bypass are now available on commodity cloud. AWS published a detailed tick-to-trade latency guide for digital-asset trading that documents the following:

* PTP Hardware Clock (PHC) on supported EC2 instances tightens clock error to typically under 40 microseconds, with hardware packet timestamping attaching 64-bit nanosecond-precision timestamps at the Nitro NIC level.
* Kernel-bypass via DPDK, AF_XDP zero-copy, and SR-IOV, plus network-optimized instances that cut p99.9 tail latency by up to 85%

No longer need dedicated physical fiber, c6in/m6in EC2 instance with PHC enabled and DPDK configured is enough. For measurement purposes, PTP hardware timestamping on a cloud CM is the single highest-leverage upgrade. Could replace software clock (the source of the jitter that sets the existing ~100ms floor) with sub-40-microsecond hardware time, collapsing the clock-uncertainty component of my floor by orders of mag.

The network-path differential would remain, but I could measure it with hardware-grade timestamps rather than jittery software ones.

#### Prior Open-Source

* Binance --> Polymarket latency-arb bot that exploits the 2-10 second lag between Binance real-time BTC prices and Polymarket's 5-minute BTP up/down odds, with explicit advice to deploy on a Dublin or London VPS for lowest latency. architecture is similar to here: separate feed handlers, test/live executor split, results.csv logging
* Polymarket x Kalshi systematic-arb writeup on dev.to with a "production-grade architecture" section, focused on short-horizon BTC markets

#### Takeaways:

* ~100ms floor is now explained and bounded by geography / physical datacenter locations + software-clock jitter. PTP hardware timestamping on a cloud VM would kill the jitter component  to tens of microseconds; it can't kill the network-path component, because the two venues are on different continents and no access point is close to both. Even this build leaves us with an irreducible geographic differential we must measure and subtract.
* goal now is to document the floor dynamically – there's a real gap. The latency-arb-on-prediction-markets material is all vendor marketing and bot repos; the academic coverage stops at equities & FX.

  * Could address the cross-venue latency structure of Kalshi vs. Polymarket, document the irreducible transatlantic floor, and explain why retail can't close it. conclude with how it relates to Buddish's arms-race and to Polymarket's dynamic-fee countermeasure
* practical upgrade: incremental and budget-scaled

  * software continuous-probing + exchange-timestamp arbiter
  * cloud VM at a chosen vantage to measure from a known entwork position instead of home connection
  * PTP-enabled EC2 instance to kill clock jitter



#### Looking Back –

Initially interested in market-structure/liquidity layer theses. This week's work on Kalshi/Polymarket has been focused on characterizing the microstructure of existing prediction-market venues and discover where edge could live – arb dead at accessible fees, LP edge dead to adverse selection, latency edge gated by co-location and an irreducible transatlantic floor. No necessarily a deviation from the market-structure focus, but an empirical foundation.

I can't credibly propose a better market-structure layer for a new asset class without first understanding why the existing venues' microstructure produces the inefficiencies it does.

Kalshi-Polymarket formalizes what's broken and why.

**Retail-vs-Institutional Latency-Arb Question:** Measurements found that cross-venue edge exists but only at the infrastructure/fee tiers that retail can't reach – institutional fees, co-location, sub-ms timestamping. This is an empirical finding about access asymmetry, and it's the seed of a thesis: *if the edge is structurally gated to institutions, is there a market-structure design (layer) that either democratizes access to it or eliminates the rent entirely?* This would be a bridge from measurement to infrastructure.



#### Substack Framing:

Equities/FX-native formalization already exists (Budish, Cramton & Shim; Aquilina, Budish & O'Neill). **The continuous limit order book mechanically generates latency-arbitrage rents that accrue to the fastest participant, competition raises the speed bar rather than competing the rent away – FBAs are a potential fix.** **They can discretize time so that speed advantages below the batch interval stop mattering. The empirical FX/equities work quantifies the races (=1/min/symbol, modal race microseconds, top firms win ~80% of races in these markets).**

I'm interested in whether prediction markets' short-duration-binary structures function as accidental frequent-batch-auctions.

* Polymarket's 5-minute and 15-minute crypto markets are *time-bounded* – since they resolve at a fixed instant. It's essentially a crude form of the time-discretization that Budish prescribes as the fix to the latency arms race.
* They're still not pure batch auctions – still match continuously within the window via a CLOB. New question is *whether the short resolution horizon changes the latency-arb dynamics relative to a continuous, indefinite CLOB – even though the matching engine is still continuous?*
* I've thus far measured that Polymarket already introduced **dynamic taker fees** specifically to kill latency-arb on these short-horizon markets. That's a venue choosing a fee-based countermeasure rather than a batch-auction one – which is itself a datapoint about whether the short-horizon structure suffices. I guess it didn't since they needed to implement the fee.



**New Question:** Does a short-duration binary's fixed resolution horizon attenuate latency-arbitrage rents relative to a continuous CLOB – and if not, what does that tell us about whether time-bounding is a substitute for, or merely a complete to, the frequent-batch-auction fix prescribed in Budish et al?
