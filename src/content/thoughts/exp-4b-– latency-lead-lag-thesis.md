---
title: "[EXP 4b] – latency / lead-lag thesis"
topic: kalshi-polymarket microstructure
date: 2026-05-31T17:42:00
---
EXP-4 requires websockets, which I currently don't have set up. Everything till now has been REST polling at 30s intervals. Latency/lead-lag measurements require sampling faster than the lag I'm measuring. I.e., if Kalshi leads Polymarket by even 5-20 seconds, a 30s poller is too slow to capture any lead.



**Engineering risk associated with building websockets –** requires persistent dual connections, reconnection logic, clock synchronization between two venue feeds, local-vs-exchange timestamp handling, message-ordering guarantees. Note that any clock-sync issue would produce incorrect lead-lag numbers.



**Clock synchronization –** claiming that any venue moved before the other, I'd need both timestamps on the same clock. I could either use my local receive-time for both, or use exchange-provided timestamps.

* the lead-lag signal I'm trying to capture is probably quite large relative to network-latency differences (on the order to tens of milliseconds), but not large relative to possible inter-venue clock skew.
* I'll use local receive-time as the initial measure, but log exchange timestamps as well (where available), and make the build report both plus the implied discrepancy. Local receive-time is always available and is the honest measure of what a co-located agent would actually observe (which is more relevant for a trading agent since you trade on what you receive, not the venue's internal clock).

  * Then, the exchange timestamps can be used as a cross-check. if local-time lead and exchange-time lead agree directionally, I can trust it. if they diverge, i'd have found a network feature and wouldn't subsequently trust the magnitude.
  * Depending on any discrepancy, I can then determine if I'll need to implement skew-calibration.
* Dead/tail markets (CLE delisted; retirements at 0.02) wouldn't generate enough updates to measure lead-lead, so I'll focus on the ~6-8 live markets to stream.
* Run duration / trigger:

  * Option 1: stream continuously and extract move-events post-hoc, or
  * Option 2: stream specifically around known catalysts (Colombia today, NBA Finals games). given today's event is imminent and is a guarateed repricing catalyst, the websocket client should be built and tested beforehand, then run live during the event. which also makes it the higher-resolution complement to F.1's 5s REST capture of the same event.
* when elections open today at 6pm ET, I'll run this command: `--start-utc 2026-06-01T05:00:00+00:00`

After running a poll check, returned 1.28% real-error rate, errors are a failure mode the websocket would have to survive.

* ConnectError: connection reset by peer (1728x)
* nodename nore servname not known (572x – DNS failures)
* RemoteProtocolError: Server disconnected (56x)
* as well as a 1h22m gap.

This is essentially 3.5 days of a mature, tested REST poller with retry logic. The network connection to these venues drops connections, loses DNS, and has multiple-hour gaps. A websocket client built and tested in the last 3 hours before a resolution event, with reconnection logic that hasn't yet proved survivability with real drops, deployed as a primary capture on a one-shot event, is risky.

I'll label the experimental websocket build as such – so as to maintain project credibility. This is a websocket lead-lag mesaurement from a client that hasn't been validated against a clock-sync ground truth.



Plan:

1. run both during tonight's resolution event (F.1 – tested + experimental websocket setup)
2. F.1 is the primary capture since it's validated.
3. I'll label the websocket data as provisional til the clock-sync cross-check passes.
4. At 6pm ET (22:00 UTC), I'll launch F.1's Colombia capture.
5. Simultaneously, I'll launch the newer websocket client on the selected 6-8 catalyst-active markets, with reconnection logic, logging both local-receive and exchange timestamps.
6. Both will capture the full count window.
7. Tomorrow, I'll build F.2 / EXP-4 analysis, cross-checking the websocket's local-time lead against exchange-time lead. If they agree, the websocket data will have been validated, acting as the primary-source lead-lag figure, which I'll deploy on the NBA resolution events thereafter.



#### Dual-venue websocket client build for cross-venue lead-lad (EXP-4b)

Goal: stream live orderbook updates from Kalshi & Polymarket on 6-8 active markets, logging both LOCAL-RECEIVE timestamps (primary endpoint) and EXCHANGE timestamps (cross-check). Built to run tonight during the Colombia first-round count, ALONGSIDE the F.1 REST capture which remains the capture of record. This client is experimental until its clock-sync cross-check passes.

Time constraint: needs to be deployable in <60min. Should favor a correct minimal client that survives reconnection errors over a feature-rich one that doesn't. Reconnection resilience is NON-NEGOTIABLE (the REST daemon loggied 1728 connection-reset + 572 DNS failures over 3.5 days – connection should be presumed to drop tonight).

Markets (6-8 active/catalyst, read condition_ids/tickers from markets.yaml):

* Colombia: intl_president_co_aesp, intl_president_co_pval, intl_president_r1_co_ica (tonight's catalysts)
* NBA live: nba_finals_okc, nba_finals_sas (active series, frequent price moves)
* Peru: intl_president_pe_rpal (deepest book, moves)
* Optional: intl_mayer_kr_oseh, us_mayor_la_kbas



Venue WEBSOCKET endpoints – verify current endpoints/subscribe formats from each venue's API docs before building (no assumptions):

* Kalshi: websocket orderbook/ticker channel (needs auth? confirm – if it requires API key auth and we don't have ws auth set up, fall back to fast REST poll loop for Kalshi at 1-2s and note; don't want to block the build)
* Polymarket: CLOB websocket (market channel). Confirm subscribe message shape and whether it pushes full book or deltas

If either venue's ws can't be stood up in time, that venue degrades to a 1-2 REST loop and the client logs which mode each venue is in. A working asymmetric capture is better than a broken symmetric capture.



Client Requirements (`scripts/ws_leadlag.py`):

1. Two concurrent connections (asyncio). Each writes every update to a shared append-only log
2. per message logged: local_recv_utc (tz-aware, time.time() at receipt), exchange_ts (venue-provided, nullable), venue, market_id, best_bid, best_ask, mid, raw_seq/update_id if provided.
3. Reconnection: on disconnect/reset/DNS-fail, exponential backoff reconnect (0.5, 1, 2, 4, 8s, cap, infinite retries), re-subscribe on reconnect, log a RECONNECT event row with gap duration. A dropped feed must self-heal, not die. Shouldn't let one venue's drop kill the other
4. Heartbeat: every 30s log a STATU line per venue (msgs received since last status, connection state, seconds since last msg). This is how I'll be able to tell a market that's quiet but alive compared to silently dead. This is crucial since pre-results books may be flat.
5. Output: data/raw/ws_leadlag/colombia_r1/<date>.jsonl (append-only, crash-safe – flush per write). gitignored
6. Graceful SIGINT: flush and exit, log session summary (total msgs/venue, reconnect count, total downtime).
7. caffeinate-wrapped run command for the live session













#### Build Analysis: clean

* reconnect gate passed (0.757s recovery, re-subscribe, one venue drop doesn't kill the other)
* both venues are live
* timestamps tz-aware and dual-logged
* trusted as experiment: Yes
* ready to run during resolution event tonight



**\*\*NOTE: Kalshi's websocket requires API-key auth even for public orderbook data, so Kalshi fell back to a 1.5 REST poll.**\*\*

This means the two venues are being sampled at different rates and through different mechanisms. Polymarket is being sampled via true-push websocket (sub-second, event-driven); Kalshi = 1.5 REST poll. Asymmetry could directly skew lead-lag measurement – 

* If Kalshi appears to "lag", i can't tell whether Kalshi actually repriced slower or whether the 1.5s poll just *observed* the move up to 1.5s after it happened while the Polymarket websocket caught its move instantly.
* The measurement floor on any "Kalshi lags" signal is ~1.5s, and any lead smaller than that is unmeasureable / just an artifact of the measurement asymmetry
* Conversely, a signal that Polymarket lags Kalshi is more clear, because Kalshi poll can only make Kalshi look slower, not faster – so if a PM lags even with this handicap working against that finding, I can likely trust it more.



#### Live Update: 21:15 UTC

Realized that polls close at 4pm UTC-5, which is 5pm ET = 21:00 UTC, not the initially thought 6pm ET I'd been waiting for. I ran commands at 5:12pm ET.

Found that preliminary results will begin flowing on the Registraduría platform shortly after the 4pm close. Counting is apparently pretty fast, with results clear before sundown.

I immediately launched the capture commands, with an immediate start each. **I'll deal with implementing the Kalshi API Key credentials for a websocket client build for Kalshi tomorrow, after the resolution event / repricing period ends (sometime tonight ET).**

1. launched the websocket for polymarket (starts capturing on launch, no scheduled start): `caffeinate -i uv run python scripts/ws_leadlag.py --out data/raw/ws_leadlag/colombia_r1`
2. then launched F.1 with start-utc = now, not 22:00 as initially scripted: `caffeinate -i uv run python scripts/poll_event_window.py --markets intl_president_co_aesp,intl_president_co_pval,intl_president_r1_co_icas --interval-sec 5 --start-utc 2026-05-31T21:15:00+00:00 --end-utc 2026-06-01T05:00:00+00:00 --label colombia_r1`
3. the 30s daemon is already capturing – that's the backstop in this analyses.



After ~10 minutes, both terminal commands were running with zero errors, zero reconnects. At this point I'm recording the event at three different resolutions.

**Important Signal:** PM message volume in the first ~2-3 minutes of polling (via websocket client for PM) was quite low and intermittent – last_msg gaps of 5.6s, 20.5s, 35.6s. That means the Polymarket book on the Colombia markets weren't repricing much at this point.

A few minutes later, I saw +N values of 12, 18, 36, and 115, in a single 30s heartbeat with last_msg 0.1s ago. That was a 6x jump from the +18 a moment earlier. This showed PM repricing pretty hard. The **onset was ~21:18 UTC**; the sharp acceleration was in the last minute or two, and this spike is exactly the event I was trying to capture tonight, now being recorded at PM sub-second resolution.

Later, when I deal with implementing the API key credentials for websocket client build on Kalshi, I'll note ~21:18 – 21:20 UTC as when the results began moving the books. F.2 will want that as `--catalyst-utc`; and i'll pin it exactly from the jsonl later for exactly-second catalyst timing.



For now, I'll let the websocket + REST poller at 1.5s intervals run. The asymmetry to keep in mind is as follows: PM is catching every sub-second tick of this repricing, while Kalshi is sampled every 1.5s. So I'll be able to measure "did Kalshi's 1.5s-sampled mid move before or after Polymarket's tick-level mid" at seconds-scale resolution – which is the right scale for this catalyst. I'm interested in whether PM lags Kalshi (this would survive the sampling handicap) or the reverse (Kalshi lags PM, which the 1.5s REST interval could artificially generate).
