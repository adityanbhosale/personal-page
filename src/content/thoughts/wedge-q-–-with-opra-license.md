---
title: Market Measured Wedges for Binary-Driven Funds
topic: Martingale
date: 2026-10-12T01:07:00
---
Intentions for live data - run live market-measured wedges in the following structure:

1. Identify a list of binary-driven funds (i.e., Ishara, Acuta, Marshall Wace, etc.);

2. Analyze holdings through public filings

3. Build paper-traded event swaps on isolated tail risks in events pertaining to concentrated holdings in their portfolio;

4. and determine market-measured statistics to quantify the portfolio value of our paper-traded 'hedges', given the proper liquidity.



The trades are less concerned about the competitive quoting / follow-engine model, since fully collateralized underwriting is a base-case assumption for now as we try to build buy-in from hedging parties. Rather, the trades should be more focused on the hedging-parties' positions, payouts, notionals, concentrated holdings, portfolio value derived from our contracts, etc.



\----------------------------------------------------------------------------------



*Martingale paper-trades event swaps that hedge catalyst risk in the concentrated holdings of binary-driven biotech funds, then measures what each hedge would have cost the fund and paid it at options-implied prices.*



Capacity is assumed, with each qualifying hedge filled at full size, which puts competitive RFQ and follow-on algo out of scope of this simulated book.

We care about counterparties' positions, notionals, premiums, payouts, and event-day P&L.



##### Data / Licensing

* backtests require no OPRA license, since OPRA treats session's data as historical from the next session's open, and Databento's historical API already serves it

  * L1 quotes are flat-priced inside our subscription
* live data external distribution (current data) requires an OPRA Vendor Agreement (not signed) + Exhibit A marked "Both".
* Currently, our license only covers internal use.



##### Holdings

13Fs are the base of our holding data, but various gaps exist. Filings come from EDGAR, which needs `SEC_USER_AGENT` set in the cloud environment

Form ADV comes from the SEC's advisor database: IAPD

Various gaps in holding data must be addressed in different ways:

1. Missing shorts and OTC hedges.

   * FDA and Ph3 moves are company-specific, so an index or peer short rarely offsets them; only a same-stock short, put, or OTC swap can. We net the fund's reported puts on the stock against the long (13Fs list options by the shares underlying). Same-stock shorts and OTC hedges come only from the fund, so 13F concentration is an upper bound on unhedged exposure.
2. End of Q snapshots filed with delay.

   * Fill in missing data with faster filings. Holdings above 10% file a Form 4 within 2 business days of each trade, though coverage is patchy since many specialist funds stay < 10%. A scheduled 13D is due within 5 business days and its amendments within 2.
3. Was the position held through the event?

   * Count a backtest position only if it shows on both sides of the catalyst.
4. Multi-strat fillers such as MW file on 13F across strategies.

   * Measure concentration as a share of the company's stock and in $ at risk; neither depends on how the 13F aggregates.
   * For share of fund, divide by Form ADV.
5. Reported positions only estimate the current book.





##### Reading q from chain:

* Use the extraction path outlined in A23: `capture_q_snapshot` hands Databento's OPRA.PILLAR data to `paper_book.quote_one`, which picks T1 (some expiry between the read and the event resolution date) and T2 (the first expiry post event), estimates the T2 forward and fits the two-lognormal mixture in `pzero_fit`.
* q is the risk-neutral weight on the favorable branch, and a hedge pays on the other branch

  * permium @ q is 1 – q per unit notional.
