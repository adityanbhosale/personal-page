---
title: Results & Documentation
topic: kalshi-polymarket microstructure
date: 2026-05-26T14:53:00
---
Note that all exec_* fields are 0.0 across every market & every structure. The full book-walk produced zero fillable contracts for every market-structure combination. **Every cell of the executable arb table is 0.0**.

What's different than expected is that the NYK row has `discrepancy_direct = -0.15cents` meaning Polymarket YES at 0.2585 is *cheaper* than Kalshi YES at 0.260, but executable direct is still 0.0. This odd, but makes sense because **lockable spread is computed at *top-of-book,*** but the executable computation requires *crossed* books (best bid on one venue > best ask on the other). A 0.15 cents mid-discrepancy doesn't necessarily produce a crossed book.

To summarize: **mid-discrepancy ≠ executable arb opportunity.** Even though the NYK market showed a 0.15c paper discrepancy in the mids, neither best bid crosses the other market's best ask (polymarket best bid 0.258 < Kalshi ask 0.27; Kalshi best bid < polymarket best ask 0.259).

This tells us that no edge exists at all at the top-of-book level in the first place, because the spreads on at least one venue are wide enough that no cross-venue match occurs.

Thus, a trading platform can benefit a user by observing pricing convergence and venue-specific liquidity events in real time, since the edge that exists at the *mid* level never crosses the book and so never offers an executable trade.

#### Full Project Recap

The goal was the build a real-data artifact that explores cross-venue prediction-market trading infrastructure. I wanted to operate on native Kalshi / Polymarket data.

I already had a venue-mechanism sweep in pure simulation to stress-test hybrid vs. amm vs. clob orderbook designs, and an LS-LMSR liquidity model built. Both were technical, but neither operated on actual prediction market data.

##### What was built:

A new repository – kalshi-polymarket-microstructure - public.

I started with a pipeline validation block. Repo was scaffolded with uv + pyproject.toml. I then built two thin venue clients: `clients/kalshi.py` (public `/markets/{ticker}/orderbook` endpoint, no authentication necessray) and `clients/polymarket.py` (real-only `ClobClient` + Gamma API for market discovery). I aimed to generate one validation notebook pulling one orderbook from each venue.

The next phase of the build (Ph2) involved mapping existing public markets. The initial goal was to curate 8 cross-venue pairs across 4 categories (sports, macro/Fed, politics, crypto). This discovery process surfaced that Kalshi's `/markets?status=open&limit=500` returns auto-generated paylay markets (KXMVESPORTSMULTIGAMEEXTENDED with 418 entries) that swamp the result set. I then pivoted to the Kalshi `/series` endpoint for proper catalog browsing. This revealed the cross-venue universe was much thinner than I'd initially anticipated – many Kalshi series (Fed, Politics) had no Polymarket equivalents, and many Polymarket markets (GTA VI tail bets) had no Kalshi equivalents. I ended up settling on 3 NBA Finals 2026 markets  – OKC, CLE, NYK – as the only category with substantial bilateral volume ($110 combined open interest). I added a helper function – `kalshi.search_markets()`– and documented the edge cases (NYK NO token 404, Polymarket silent 404 on malformed IDs). The 'asymmetry beyond NBA Finals' finding came out of this part of the project, which ended up being a headline finding.

Then, I started building the actual analysis library – `src/pm_micro/normalize.py` (a dataclass-based unified book representation; reconstricted Kalshi asks by complementarity) and `src/pm_micro/microstructure.py` (spread/depth/mid computations). This library involved 6 pytest tests covering the load-bearing math – a snapshot script fetched all three markets, normalized, and produced a CSV with 11 rows of metrics. The three figures in the repository visualize spread by venue, depth within 1cent of mid, & book shape (price levels). 3-regime findings: OKC was clean, NYK 20x spread asymmetry, CLE demonstrated a one-sided tail.

Phase 4 – cross-venue arb. I implemented `src/pm_micro/arb.py` with 3 layers (paper mid-discrepancy, naive crossed-book, executabl-after-fees) and 2 structures (direct YES vs YES, synthetic YES_Kalshi + NO_Polymarket). It also involved integrating the conservative fee model (2% Polymarket taker; $0.02/contract on Kalshi), which required a driver script supporting both `--fresh` and snapshot-replay modes. The fresh run revealed that OKC's paper discrepancy had decayed from 1cent -> 0.5cent -> 0.0cent over ~36 hours, and that Polymarket's NYK book had disappeared entirely between snapshot. Executable arb was 0 across every market-structure combination.



#### 24 hr update to market states: new 404s

Today, the following features were meant to be run / implemented:

* snapshot ledger – create data/processed/snapshot_ledger.yaml; populated with thee three known historical observations plus a fourth from a new fresh fetch
* run one more fresh fetch (`uv run python scripts/compute_arb.py --fresh`). i then examined the output and appended a 4th entry to snapshot_ledger.yaml using the actual timestamp of this run and the actual OKC discrepancy from the output. the status of the NYK YES Polymarket book is whatever the run reports (likely still a 404; i'll document the actual observation). the idea was that if the 4th OKC discrepancy is 0.0 (i.e. convergence held), the finding would be strengthened. if it had reverted (i.e. back to 0.5cents or 1 cent) the finding changes and I'd document that.
* i'd then update scripts/compute_arb.py to append on the new ledger writes. I actually modified the script so that each --fresh run automatically appends an entry to snapshot_ledger.yaml. Specifically, at the end of main() when running with fresh=True, the script would read the existing ledger, append a new entry built from the actual run output for OKC, and write back.
* lastly, I intended to create notebook/04_writeup_figures.ipynb to document everything

Here's what actually happened after implementing all these new builds / changes:

* CLE Polymarket book had alo 404'd. This was pretty substantial. Going in, the assumption was that NYK was the only market that Polymarket drew from. The 4th fresh run shows that CLE's Polymarket YES is non 404 too – same 'No orderbook exists for the requested token id' error as I'd previously gotten for NYK. The last snapshot had it active (138 ask levels, pricing the tail at ~0.4%). This meant one of my findings just got stronger. the de-listing pattern isn't NYK-specific – it's two of the three Polymarket books in the dataset I curated. Polymarket is systematiclaly withdrawing liquidity from these markets as the Finals approach resolution, but Kalshi seems to be maintaining books on all three throughout. This is a much sharper venue-reslience claim that I'd originally had, if it's correct.
* OKC convergence seems to have held – and both venues moved together. Between observation 3 (0.00¢) and observation 4 (0.00¢), both venues' OKC mids dropped from 0.485 to 0.455 (a 3-cent re-pricing of the championship probability, presumably from an actual NBA Finals game between fetches). The discrepancy stayed at 0 through that move. The venues didn't just equilibrate once and freeze – they're tracking each other through subsequent price changes.
* The auto-append spec bug is correctly fixed. The agent (Opus 4.7) caught that the literal `'404' if nyk-row["Polymarket_yes_mid"] is None else "active"` check would mislabel snapshot-fallback rows as "active" because the fallback preserves the snapshot's non_None mid value. They fixed it by extending the check to also flag `data_source == "snapshot_fallback"` as 404. This is good because the bug would have polluted future ledger entries.



#### Concern

I wasn't sure that Polymarket's NYK book had disappeared – wanted to verify all claims aforementioned about snapshot discrepancies briefly. Ran a terminal command to directly query Polymarket for the NYK YES book using the `markets.yaml` token, and *also* re-fetch the canonical token ID via Gamma API to compare. This does a few things: prints the token IDs I'd previously stored in markets.yaml; fetches the orderbook firectly from those tokens; & re-discovers the Knicks market via Gamma API and shows the current canonical token IDs, plus whether the market is active / closed.

**Outcome:** The finding was pretty concerning. The returned Gamma API tokens DID NOT match the stored tokens. This means either Polymarket re-issued tokens for the Knicks market since I initially curated, or (more likely) the values stored in `markets.yaml` are subtly different from the canonical ones.

Essentially the token IDs I was using to query Polymarket data were stored as truncated 14 character strings in markets.yaml. This was noted while creating the script, but a failsafe of "if Cursor or the validation step flags a length mismatch, re-fetch data" was implemented. Unfortunately, neither method caught the mismatch. Every Polymarket query since (each Phase 3 snapshot row for NYK & fresh fetch for NYK + the recent diagnosis) has been hitting Polymarket with 14-character long truncated token IDs for market search, of course then returning 404s, which I've been wrongfully interpreting as 'Polymarket withdrawing liquidity'.

To address this, I parsed through markets.yaml to see what it actually contained – the damage was contained. Looking at the actual state, the OKC tokens are full-length and validated & CLE tokens are full length and validated. All three NYK IDs are truncated. I then fixed markets.yaml NYK entry and adjusted it use the canonical token IDs from the diagnostic just run. Note that I used yes_token_id and no_token_id ending in the values from the diagnostic. Then I retested CLE to verify whether the CLE Polymarket query genuinely 404s or if there's a different bug.

**CLE re-query:** CLE tokens are actually full length (77 chars each) – and YES still returns 404 from Polymarket's CLOB. This is arguably the cleanest possible diagnostic outcome for understanding what's happening. Thus, the CLE 404 is real, not a token bug – Polymarket withdrew CLE (the extreme tail probability market, ~0.4% YES probability at Phase 3 snapshot). NYK appeared to disappear because of a stored-token truncation bug; the canonical NYK book is likely still live (pending agent's fix & run).

After re-running the CLOB verification on the proper NYK tokens, NYK YES returned 125 bids & 90 asks, implying real, verified book & the token bug suspected. NYK NO returned 404 – genuinely delisted.

However, there's some nuance left to consider in the NYK YES book. the 125-bid / 90-ask figure looks healthy, but looking at the prices – best_bid = 0.001, best_ask = 0.999 – the book has a 99.8-cent spread on a market where midpoint should be ~26¢. NYK is structurally active but in a degenerate state with quotes parked at the extremes – market-makers are no longer quoting a meaningful mid because everyone knows the answer, but they're leaving boundary quotes in place to catch any flow.

The Knicks have presumably been eliminated, market-makers have packed up the meaningful quotes, and what's left is degenerate boundary liquidity. This is an interesting microstructure finding: **Polymarket leaves "lighthouse" quotes at 0.001/0.999 on effectively-resolved markets, rather than fully delisting (like they did with CLE at NYK NO).**

#### Next Steps: re-run & regenerate

Step 1 is to re-run the fresh fetch. This pulls new orderbook data for NYK (now with correct tokens), and appends a fresh entry to `snapshot_ledger.yaml`, and regenerates `arb_results_fresh.csv` with correct NYK data.

* worked, meaningful result

  * OKC – mid_disc direct 0.00¢ synthetic=-0.00¢ – full convergence holds. 5th data point is at 0.
  * CLE – still 404 Polymarket fallback to snapshot. This confirms CLE is genuinely delisted from Polymarket
  * NYK – new data point: mid_disc direct=0.25¢ synthetic=n/a. Polymarket NO failed (404, structural – confirms my Phase 1 finding). But the direct discrepancy of 0.25¢ is important. Kalshi NYK and Polymarket NYK YES are **both** producing real prices at the moment.

    * Specifically, this means that Polymarket YES is in the aforementioned "lighthouse mode" – best_bid 0.001 / best_ask 0.999 – and Kalshi is pricing NYK YES somewhere around 25¢ from the prior snapshot. The 0.25¢ figure is a *midpoint-*of-mids value. Polymarket's midpoint of (0.001 + 0.999) / 2 = 0.500, vs. Kalshi mid ~0.26. This makes sense given the `mid_disc direct=0.25¢` means $0.0025, which is a conventional spread value. If so, Polymarket & Kalshi NYK mids are within 0.25¢ of each other.

Step 2 is to regenerate the writeup figures. This re-executes the writeup-figures notebook against the new ledger and arb CSV, producing fresh PNGs.

* initially failed on a fixable bug
* `ValueError: time data "2026-05-26T20:54:50.706060+00:00" doesn't match format "%Y-%m-%dT%H:%M:%S%z"`

  * Pandas' pd.to_datetime is getting stuck on the snapshot ledger's timestamps because they contain microseconds, but the format string in the notebook didn't allow for them.

After re-fetching, found that Kalshi's NYK book showed differently than initially thought. Kalshi NYK YES has 4.65M contracts bid at $0.01. And NO has 8.15M contracts bid at $0.01. That's substantial stub liquidity at the extreme tails on both sides of the market. This is essentially the same "lighthouse mode" Polymarket showed, but at a much larger scale an on Kalshi. Both venues have effectively packed up the meaningful quotes on NYK and left only boundary liquidity. Market's resolving towards no, likely because the Knicks have been effectively eliminated, or so thought.

Note that the spread between the actual best bids on both sides of Kalshi tells a more interesting story. YES bid at $0.01, NO bid at $0.01 – meaning YES ask (=1 – NO bid) = $0.99. So Kalshi best_bid = $0.01, best_ask = $0.99 on YES. That's identical to Polymarket's degenerate state.

Both venues are in the same degenerate state. Both have the same midpoint by simple averaging: 0.50. The "0.25¢" mid-discrepancy reported by `compute_arb.py --fresh` is the difference between Polymarket's $0.50 mid and Kalshi $0.50 mid – ~0. The 0.25¢ can be attributed to rounding noise, fee model, or size-weighted-mid drift. It's not a real cross-venue opportunity.

At the end-of-event, both Kalshi & Polymarket converge to the same degenerate lighthouse state, which I find to be a really interesting microstructure observation. **The venues *agree* even when they've stopped pricing meaningfully – boundary quotes at $0.01/$0.99 on both venues, no real flow possible.**
