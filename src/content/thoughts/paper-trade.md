---
title: paper-trade
topic: Martingale
date: 2026-08-20T13:39:00
---
## Paper Trades:

Goal is to build paper-trading simulation based on the two-lognormal model applied to listed options to simulate what Trade #1 would be quoted at initially for a variety of ongoing catalysts (ideally those that are resolving in the next 2-3 weeks). This was built on the existing two-lognormal fitting model & dossier machinery.

Data Source: ThetaData options chains; we care about **synchronized snapshots, intraday quote history, quote-level data, then latency.** ThetaData is options-focused with trade and quote data, implied volatility, and both real-time streaming and historical access, bulk endpoints for pulling whole chains, and deep intraday quote history.

Candidate Set: needs to be mutually curated (5-8 names, in a `catalyst.yaml` registry). Pulled 13Fs on all 6 funds recommended; intersections of positions ranked; CAPR/RARE/COGT/ALMS/VERA/AXSM + PRAX

Architecture: we'll simply extend `martingale-pricing`, same repo, same stdlib-only rule, but let the fetch module use urllib for HTTPS to ThetaData

What is a paper quote?

* One quote record per (catalyst, capture date); q, conditional move, base_vol, all diagnostics with verdict, the wedth against the stratum p (0.70 PDUFA, labeled), the approval-pays price per unit at q, the band, and the fee as a separate invoice line.
* Since the negotiated premium above q is the one thing a simulation can't know, we'll score at 3 hypothetical premium levels (at q, at q + fixed spread, at the band's upper edge) so resolution P&L comes out as a range. At resolution, we'll record the outcome from the FDA action or issuer PR, settle the leg at 0 or 1, and produce warehouse and hedger P&L per premium level, plus q drift across the captures and a small calibration table.

Modeling Process:

* Short T1 horizons make base_vol noisy; if T1 is under two weeks out, estimate it from the T1 ATM straddle rather than a full fit, and record which method was used. American exercise is a tolerable approximation on OTM options for zero-dividend biotechs, we'll put it in assumptions rather than solving it.



##### *ThetaTerminalv3.jar is running locally (Java via temurin, creds.txt auth)*, serving the v3 REST API on 127.0.0.1:25503

##### What was Found:

1. Six ad-hoc probes on the shortlist with placeholder dates: all 6 refused honestly, and the IV term structures split them three ways – CAPR and ALMS showed a violent inverted front vol (event nearer than the placeholder), RARE showed a genuine upward cliff (event priced between expiries), AXSM/COGT/PRAX flat (including PRAX's real Dec 27 date, reading as consensus/extension skepticism.
2. Date research then confirmed what the vol was saying: CAPR's PDUFA is Aug 22, RARE has two – DTX401 Aug 23 and UX111 Sept 19 – while ALMS's near even is a soft-dated readout that fails the screen.
3. SPY probe (q = 0.9877 off pure skew) demonstrated why ad-hoc probes never carry a prior or get scored.



##### What's Running Now:

1. Agent is adding 3 registry entries – auditing the same-ticker collision the two RARE entries create, and producing the first registered quotes with today's pre-event chains

   * CAPR Aug 22
   * RARe Aug 23
   * RARE Sept 19
2. Tomorrow (Friday) morning: one re-capture of CAPR and RARE for the final pre-event read before the Aug 21 expiry dies.
3. Saturday / Sunday: the two PDUFAs resolve; no data capture needed (market closed, and the weekend 472 behavior is expected)
4. Monday: `paperbook resolve` on both outcomes with announcement URLs, then the report produces the book's first scored P&L – three days after the pipeline was built (that would be great).

   * UX111 (Sept 19) continued as the clean monthly-bracketed tracked case, and the standing weekly registry-refresh prompt handles COGT/AXSM/VERA and everything after.



##### Ph1 – Data Layer

(registry, providers, capture, expiry selection). Constraints: stdlib only; network permitted ONLY in src/providers.py – HTTP to the lobal ThetaBata terminal (base URL from env THETA_BASE, default http://127.0.0.1:25503) and to api.tradier.com/sandbox.tradier.com (token from TRADIER_TOKEN, base from TRADIER_BASE). everything else runs offline on cached files. Not going to modify chain_io.py, pzero_fit.py, deploy_calc.py, or dossier.py.

Going to start by reading the fixtures in data/fixtures/thetadata/ (captured live from my terminal: SPY expirations, one SPY bulk chain snapshot, VERA expirations).

We already know that v3 responses default to CSV with a header row (the .son extensions are misnamed – parse as CSV); endpoints are /v3/option/list/expirations?symbol=X and /v3/option/snapshot/quote?symbol=X&expiration=YYYY-MM-DD (bulk chain when strike/right omitted); the expirations list is full-history, so selection must filter to expiries after asof; snapshot rows carry per-contract timestamps that differ by a matter of seconds – record min and max row timestamp in the manifest as the capture's synchronization spread instead of assuming one instant.

Columns:

* timestamp
* symbol
* expiration
* strike
* right
* bid_size
* bid_exchange
* bid
* bid_condition
* ask_size
* ask_exchange
* ask
* ask_condition
