---
title: Kalshi websocket client build
topic: kalshi-polymarket microstructure
date: 2026-05-31T23:04:00
---
Rationale behind setting up a WS client for Kalshi orderbook data & messages is to remove the 1.5s sampling asymmetry so I can make sub-second lead-lag claims. However, sub-second claims are require the previously discussed **clock-sync cross-check** to pass – and on a symmetric WS-vs-WS capture, so I'm now comparing two venues' local-receive timestamps where the network-latency *differential* between me <--> Kalhi and me <--> Polymarket becomes the dominant uncertainty at sub-second scale.

We previously saw \~340ms PM network jitter while monitoring the Colombia resolution event. If Kalshi's path is even \~100ms different, a 200ms Kalshi lead could be attributed to pure network geography. **Symmetric websockets results in finer sampling, but don't automatically return trustworthy sub-second latency figures.** I'd still need to characterize the network-latency differential before any sub-second lead is defensible.

An initial WS auth can be built, involving RSA-PSS signing, tested on Kalshi's demo environment first per their guidance, confirming a clean handshake and real book message on quiet markets. I could then run the reconnect self-test. The true endpoint is seeing a validated symmetric client exists, not that any event was actually captured tonight.



#### Design Constraints:

1. Demo-first vs straight to prod: Kalshi's docs recommend developing against a demo. I'm going to build and validate the auth handshake against `demo-api.kalshi.co` first, which will tell us whether the RSA-PSS signaling is correct, and if my account permissions are right. Then, I'll switch to prod for deployment. The only caveat is that demo books might be thin and simulated, so the handshake could validate on demo, but the true capture runs on prod. I'll take this two staged approach to the WS setup.


2. Kalshi's official SDK v. hand-rolling the signal: Kalshi docs also mention an official async Python SDK (`kalshi-python-async`) which handles RSA-PSS signing for me. Hand-rolling gives me control and no dependency, but signing bugs are a significant concern and the SDK would eliminate them. Thus, I"ll use the official SDK for auth/signing, wrapping its WS in my existing connection-manager pattern (reconnect, heartbeat, dual-logging) so it slots into `ws_leadlag.py`.


3. Scope – replace Kalshi's REST fallback in the existing `ws_leadlag.py`, or build a separate client? I'll just modify `ws_leadlag.py` so Kalshi has a real WS path and keeps the REST fallback (if WS auth fails at runtime, degrade to the 1.5s REST that already works so as to not lose any capture).
