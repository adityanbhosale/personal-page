---
title: Data Access
topic: Martingale
date: 2026-09-29T14:54:00
---
DATABENTO



L0: derived & reference-grade that carries no quotes: OHLCV bars, Definitions (contract reference data: strikes, expirations, symbols), Statistics (open interest, settlements), and Status (trading halts and session states).

L1: top of book tick data (bid/ask and trade records). Includes CMBP-1 (consolidated market-by-price at depth 1, quotes and trades in a single stream), CBBO (consolidated best bid/offer), TCBBO (trades stamped with the BBO at trade time), and Trades (last sale only).



Requirements for Sim / Syndication-API:

* wedge: q-p at capture time

  * need synchronized q snapshot from the sponsor's live option chain at the moment the quote is recorded.
