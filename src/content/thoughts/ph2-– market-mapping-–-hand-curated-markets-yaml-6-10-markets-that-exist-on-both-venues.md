---
title: Ph2 – Market mapping – hand-curated markets.yaml. 6-10 markets that exist
  on both venues.
topic: kalshi-polymarket microstructure
date: 2026-05-25T17:33:00.000-04:00
---
**Market Curation: Cross-Venue Market Mapping**

Goal: build a curated set of 8 binary prediction markets that are listed on **both** Kalshi & Polymarket, spanning 4 categories (Macro/Fed, Crypto, Politics, Sports).

Methodology: agent proposes candidate pairings per category; user approves each before it lands in `markets.yaml`. The idea is that manual curation beats fuzzy text matching because question wording diverges sharply between venues (Polymarket is conversational, Kalshi is formal).

Output: `markets.yaml` with 8 approved entries.

Design choices:

1. Since phase 2 is meant to produce `markets.yaml` (the cross-venue mapping), how should I select pairings?

   * manual curation, agent assists. this way, the agent helps discover candidates (high-volume markets on each venue, fuzzy-matches on question test) and proposes pairings, but I'd have to manually approve each entry before it lands in `markets.yaml`. The agent builds the discovery infrastructure; i'll make the curation decisions
   * this was, no mismatched pairings will occur (e.g., Kalshi's "Fed hike by Dec 2026" paired with Polymarket's "Fed cut by Dec 2026" – same underlying question, opposite resolution).
2. How many markets & what categories?

   * 8 mapped markets across 4 categories, two per category for some category-level analysis

     * Macro/Fed (already have one)
     * Crypto
     * Politics
     * Sports
3. Appropriate Ph2 output?

   * `markets.yaml` + discovery notebook + a `kalshi.search_markets()` function added to the client
   * helper is needed, and the discovery notebook becomes an audit history.



BugFixes before Curating Markets Manually:

Issue 1: ValueError in every Polymarket cell (ValueError: Unknown format code 'f' for object of type 'str'). This is likely happening because Polymarket's Gamma API returns 'volume' as a string, not a floar. This causes every Polymarket candidate listing to crash before printing the candidates. Thus, we can't see Polymarket markets to choose from.

Issue 2: All 4 Kalshi sports series returned empty

Issue 3: All Kalshi politics series were empty. Same root cause as #2 – wrong series ticker guesses.



All issue fixed.



Rerun – no more format errors, but deeper structural issues in the jupyter notebook. Kalshi has FEDHIKE markets, but Polymarket has no markets mentioning 'Fed'. This isn't a search-string issue, there genuinely doesn't appear to be any active Polymarket Fed market at the moment. Regarding Crypto: Kalshi has 50 KXBTC markets – but every single one with a 24-hr Bitcoin price range market resolving today (May 25, 2026) with vol = 0.0. Same series, every market's dead. Polymarket has 1 BTC market – the "$1M before GTA VI" lottery ticket I already came across. This isn't a true match, one is a daily intraday price range, the other is a multi-year tail bet. Regarding Politics markets: 0 Kalshi politics markets found via keyword filter (across 500 results). Polymarket showed 1 result ("Trump out as President before GTA VI?" with $657,824 volume – but no Kalshi equivalent exists right now. Regarding Sports markets: 0 Kalshi sports markets via keyword filter. Polymarket has 3 NBA Finals markets (OKC, Cleveland, Knicks).

This means I have one real cross-venue pairing showing up right now – the Fed hike market – and I don't even have a Polymarket equivalent for it. The other three categories have 0 viable pairings. Here's what I think could be happening:

Possibility 1 – seasonal thinness – it's late May 2026 so maybe just a factor of the timing.

Possibility 2 – keyword filter is too narrow. The Kalshi /markets?status=open&limit=500&min_volume=5000 query is returning 500 markets, but my keyword filter is finding 0 Sports / 0 Politics. That suggests that either the keywords don't match Kalshi's title conventions, or Kalshi's high-volume markets right now are entirely in categories I'm not searching (crypto daily ranges, weather, financials, etc.). I ran a diagnostic terminal cmd to show what series of Kalshi markets are actually open right now without any keyword filter or volume filter, essentially showing the real shape of the data – what Kalshi has and doesn't have.

Output:

`Total returned: 500`

`Top 20 series by market count: KXMVESPORTSMULTIGAMEEXTENDED 418 markets; KXMVECROSSCATEGORY        82 markets.`

This means the 500-limit is hitting before we're seeing any relevant markets. The output is heavily dominated by one or two series. Therefore, I need to use pagination or min_volume filters set higher to skip noise. The right Kalshi discovery pattern is **per-series, not unfiltered**. This worked in the FEDHIKE query earlier – when we specify the series_ticker, we get clean numbers of markets . The unfiltered query is useless in this purpose; the series-filtered query is the right approach.

Ran another diagnostic to query Kalshi's /series endpoint (the catalog of series, not individual markets within them) and filters my keywork. The output gave real series tickers for politics, sports, & crypto. Kalshi turned out to have way more series than I was initially guessing at. So, I dumped the full series list into a file.

After putting the JSON on disk, here were the series that looked most cross-venue-eligible based on what's already on Polymarket:

* Macro/Politics – Kalshi: KXTRUMPOUT – matches because Polymarket has "Trump out before GTA VI at $657k volume.
* Sports/NBA – Kalshi: KXNBA (NBA championship) – matches because Polymarket has 3 NBA Finals markets (OKC/Cleveland/Knicks)
* Sports/NBA – Kalshi: KXTEAMSINBAEF – same matchip, different framing – could be a second NBA pair
* Macro/Fed – Kalshi: KXFEDCHAIRNOM – matches before Polymarket may have Fed Chair markets
* Crypto – Kalshi: BTCRESERVESTATES, KXETHATG – tail-event crypto – Polymarket has GTA-VI-style tail bets
* Sports/World Cup – Kalshi: KXWCCONTINENT, KXWCFURTHESTADVANCING – both relate to WC 2026

Before manually curating, I ran another brief check to confirm that KXNBA and KXTRUMPOUT actually have active markets with adequate volume.

The check returned 4 active markets under KXNBA with substantial volume:

* KXNBA-26-SAS: San Antonio, $30.2M
* KXNBA-26-NYK: New York, $24.8M
* KXNBA-26-OKC: Oklahoma City, $18.6M
* KXNBA-26-CLE: Cleveland, $18.5M

Polymarket showed 3 NBA Finals markets earlier: OKC ($13.75M), CLE ($18.59M), Knicks ($16.01M). This gives us three direct cross-venue matchups, which seem to be the strongest cross-venue pairs available in the entire dataset. High volume on both sides, identical resolution criterion, same event. Polymarket doesn't have a "San Antonio wins" market in those 3 results, but Kalshi does – that's fine for the 3 that I can pair.

Even if I was to get zero other pairs from any other category, these 3 NBA Finals markets alone would make a credible cross-venue microstructure study because of the volume and the timeline, since Finals are happening right now, meaning the orderbooks are most active.

Key issue to flag is rate limiting: `429 Too Many Requests` on the 5th call. Kalshi's public market data is capped at about 30 requests per second – but separate from that, there's likely a per-minute or per-hour quota that I hit because of the bulk discovery work across multiple terminals and the agent's verification calls.



**I'm going to skip the full notebook curation. Will continue with three NBA Finals pairs, populated directly. The Polymarket condition_ids and token IDs need to be looked up still.**
