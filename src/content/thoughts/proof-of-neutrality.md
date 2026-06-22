---
title: proof of neutrality
topic: ATS structures
date: 2026-06-22T00:34:00
---
### Proof of Neutrality

Splits into a measurement tool & and cryptographic guarantee

* "here's how much the LPs are bleeding on Polymarket / Kalshi right now, measured from live data"
* verifiable-neutral-clearing primitive (prove that a batch cleared fairly on-chain, sealed-bid so the BP can't front-run / MEV).

### Data Accessibility

Recon Prompt: open the kalshi-polymarket-microstructure repo, report exactly how it ingests Polymarket data at the moment (API vs. on-chain, what fields, whether aggressor direction is present or inferred), identify the cheapest path to on-chain CTF Exchange fills with ground-truth aggressor sign, and sketch the minimal historical-backtest pipeline to compute aggregate maker-side adverse-selection markout – sketch only, no build.

**Results:**

* Part 1 didn't observe real trades at all. It actually just computed fills by a *price-through proxy on hypothetical passive orders* over 30-second L2 book snapshots – so the negative-markout finding is only real within that proxy, but it's two inference layers removed from ground truth: it never saw a real trade, and it never had a real aggressor sign. That's a huge gap – my historical proof is a model of adverse selection on hypthetic orders, not a measurement of it on actual ones.

  * The live on-chain tool isn't a productization of a proven result – it's the first actual measurement of the thing I've only modeled thus far.
* **Architectural Verdict:** fusion is required. On-chain `OrderFilled` gives us ground-truth fills, aggressor side, and maker addresses – but no mid-price. Markout requires a mid to mark against, and the mid only exists in the CLOB API book. So the tool must **fuse two feeds: ON-CHAIN** (ground-truth aggressor + addresses + match time) and the **API Book** (the mid reference), time aligned by tx/order hash. And the agent flagged the sharp edge: on-chain `block_timestamp` is settlement time, which lags the off-chain match by a little bit. If I align the mid to settlement time instead of match time, my markout is measuring the wrong window – contaminated by exactly the way the sim's terminal-vs-fill-time markout was.

  * The bridge (join on-chain OrderFilled to CLOB /trades by tx/order has to recover the true match time) is what has to be right.
* v1 CTF Exchange is legacy; v2 (live since late-April, address `...B996B`) is the build target, plus a separate Neg Risk Exchange for multi-outcome markets whose address the recon could not confirm – missing it means under-counting multi-outcome fills. So the build targets v2, and confirming the Neg Risk Exchange address is a pre-build task.

**Next Steps:**

Build 1: on-chain v2 `OrderFilled` decode --> ground-truth maker/taker/side --> aggregate maker-side markout against a trade-price proxy, in-memory.

### Stage 0: Contract Verification

* verified everything against primary sources, caught a real error in the prior recon, and surfaced 2 findings that change the Stage 1 plan.

**Contract Verification PASSED.** Both v2 addresses are confirmed against PolygonScan name tags *and* official Polymarket docs (primary sources, not blog guesses – exactly the bar CLAUDE.md §2 set). It also caught that the prior recon's Neg Risk candidate was the v1 address – the v2 pair is `0xE111.../0xe2222...` with matched vanity prefixes. It  even recorded the depcrecated v1 addresses in `contracts.py` to prevent accidentally subscribing to them.

**Findings:**

* The two target contracts share the same v2 topic0, because both the CTF Exchange v2 and the Neg Risk CTF Exchange v2 run the same CTFExchange v2 source. Covering both multi-outcome and binary markets is quite simple – one event signature, one topic0, subscribed across two addresses. The multi-outcome coverage I insisted on costs nothing extra.
* **v2 makes aggressor direction explicit on-chain**. The maker's side is now an explicit uint8 field in the event (BUY = 0, SELL = 1), so direction is ground truth. The agent worked out the exact recovery rule (aggressor = taker; maker = SELL --> aggressor bought; price = amount rati).

  * The `tokenId --> (market, YES vs NO)` mapping needs OFF-CHAIN METADATA but the agent correctly notes that's not needed for direction or price (both fully on-chain), so it's properly out of scope for Build #1.

**Risks Moving Forward:**

* maker-event vs taker-event de-deduplication. A single match emits N per-maker OrderFilled events plus a taker aggregate plus 1 OrdersMathced.

### Stage 1: Live On-Chain Stream  + Decode (NO markout yet).

**Task 1:** de-duplication confirmation on a live tx – gated first on purpose. PolygonScan ABI API now needs an Etherscan v2 key, so the agent couldn't solve this in Stage 0. Stage 1 routes around by using the RPC directly (i have the WS endpoint). if I build the stream and THEN discover a match emits both a per-maker and taker-aggregate OrderFilled events, every fill I've been counting would be doubled, and any markout I compute later is inflated – and I'd have built the whole loop on a wrong counting basis. Confirming the emit set on one real transaction before writing the loop locks the counting rule against reality. When it reports, the thing to check is that the de-duplication rule isn't just asserted but confirmed against what the live tx actually emitted (i.e., that the agent looked at a real match and verified the event set matches the Stage 0 expectation).

**Task 2:** sample decoded fills with correct direction – when the stream runs, look at the same fills...

* do the aggressor directions look *plausible?*

**I'll commit Stage 1 when Task 1 confirms the de-duplication rule against a live tx and Task 2 shows real de-duped fills with same ground-truth directions from both exchanges.**

#### **Stage 1 Findings:**

IT WORKS. A 90-second live run decoded 2,882 de-duplicated aggressor matches (4,169 CTF + 3,146 NegRisk/multi-outcome lines) from *both exchanges*, both directions, with ground-truth aggressor sign – and the per-maker legs reconcile to the taker aggregate.

*real fills with real aggressor direction, de-duped correctly*

***Task 1 Outcome:*** confirmed the de-dup rule on a live tx

**Another Material Finding:** The Stage 0 direction rule ("aggressor = opposite of maker's side on the same tokenId") is incomplete, and the agent only found it by sampling live data. it sampled 8 live matches and found 7 of 8 are mint/merge – the per-maker and taker legs reference different, complementary tokenIds whose prices sum to exactly 1.000. Only 1 of 8 was a same-token swap. So the Stage 0 rule – which assumed the aggressor and maker trade the same token – would have mislabeled the aggressor's token for the majority of matches. 

* **Correct Rule:** read the aggressor's leg directly from the taker-aggregate log (maker-field = aggressor, side = aggressor's own side, tokenId/amounts = the aggressor's actual leg) rather than inferring it as "opposite of the per-maker leg.".

### Stage 2: Aggregate Maker-Side Adverse-Selection Markout (PROXY MID).

Three objectives:

* mint/merge leg handling
* sign convention and whether the aggregate comes out negative
* drop rate – trade-price proxy needs a subsequent trade in the same token within the horizon to mark against – and thin markets may not have one.

  * If the drop rate is high (i.e., > 50%), my markout is computed on a non-random subset (only the liquid tokens that traded again quickly), which biases the aggregate toward active markets. That's the single biggest weakness of the proxy approach.
  * This will be fixed by the API-mid integration in the next build

#### **Stage 2 Findings: NUMBER CAME BACK NULL**

* The mint/merge gate passed cleanly. The worked example marks against the aggressor's actual token (token X), keyed by each log's own tokenId, with per-maker legs (token Y) feeding Y's path, not X's – "so the sign can't invert via the wrong leg."
* The sign is **null, and reported as null**. Median = 0.000¢ at every horizon, mean tiny, and sign-unstable across runs (∆10 was -0.759¢ in run 1, + 0.197¢ in run 2, +0.030¢ in run 3). When the sign flips run to run, you don't have a signal, you have noise.,
* The drop rate is **~15-17%**, plus ~1,300 fills left incomplete at shutdown – reported separately, never counted as marked.

The null finding is expect and is not a failure. The agent diagnosed WHY the proxy can't see the signal. A trade-price reference prints at the bid (for sells) and the ask (for buys), so the proxy conflates spread capture with adverse selection. The one semi-consistent pattern (SOLD slightly positive, BOUGHT slightly negative) is "partly a spread artifact," not a real markout.

*The proxy is TOO CRUDE to separate "the maker earned the spread" from "the maker got picked off," and those two effects roughly cancel in the aggregate, leaving ~0.*

**The stage 2 number does NOT answer the demand question of whether flow originators have LP clients being adversely selected. It's null because the instrument is too crude, not necessarily because there's no extraction.**

**Build 2 – API-mid integration – is necessary before I have a demand number.**

#### **Internal Contradiction:**

My simulation found a large, robust adverse-selection effect (the ~13sigma result), but my live proxy measurement found null. Three reasons as to potentially why:

1. The effect is real but the proxy is too crude to see it (build 2's API mid will reveal it)
2. The effect is real in the sim's parameter regime but smaller in live Polymarket than the sim suggested – the mid will show a real but modest number
3. live Polymarket LPs are NOT meaningfully adverse selected in the current regime – in which case the demand argument is dead



### **Build #2 – API /CLOB mid integration**

*Real mid-based maker-side markout. Stages 0-2 of Build #1 (ground-truth on-chain fills + price-proxy markout) committed.*

The proxy returned null because a subsequent-TRADE price prints at bid (sells) / ask (buys), so it conflates spread capture with adverse selection. The fix is to mark each fill against the order-book MID at horizon ∆, which removes the spread artifact. This build is the real demand test: does a mid-based markout reveal net adverse selection that the proxy couldn't see?

**Task A:** mid source, recon + decide. We need the Polymarket order-book mid per tokenId, time-aligned to fills. Before building, resolve the data path (web-search/fetch) as needed:

* Polymarket's CLOB API: the endpoint(s) for the orderbook / best bid/ask per token (market/asset id). REST snapshot polling vs. the CLOB WS (book/price_change channel). State what's available, rate limits, and whether the WS gives a live book we can maintain a mid from.
* KEY MAPPING PROBLEM: on-chain fills key by ERC-1155 tokenId; the CLOB API keys by its own token/asset identifier (and conditionId/market). I'll ask the agent to confirm how to map an on-chain tokenId --> the CLOB API's token id so we fetch the RIGHT book for each fill. If this mapping needs Gamma/CTF metadata, I'll ask it to state exactly what call resolves it. If it can't be resolved cleanly, STOP and report – a wrong mapping marks against the wrong token's mid (silent corruption, worse than the proxy).
* Recommend the cheapest correct approach: maintain live books via CLOB websocket for the tokens we see fills in, vs. REST-poll a mid at fill-time+∆. State the tradeoff.

**Task A Results: green light for Task B**

mapping is identity. the CLOB `token_id` is the on-chain ERC-1155 tokenId, same integer, no translation, no Gamma lookup.

* agent took a real on-chain full (tokenId, decoded BOUGHT @0.25) and queried the public CLOB directly: `/midpoint?token_id=...773047` returned a mid, and `/book?token_id=..773047` echoes back `asset_id` = the same on-chain tokenId. That's the "verify against reality before trusting" discipline applied to the exact thing that would have silently corrupted the number. The wrong token mid risk is dead.
* The mid source is public, no auth and gives me the off-chain clock I need.



*Recommendation:* WS market channel for a continuous per-token mid timeline(I need historical mid at fill-time and fill time + ∆, which REST polling can't recover – it only gives mid at present moment), seeded with a REST `/book` snapshot per newly-seen token so a mid exists immediately. The comparison table makes the case cleanly.



**Task B:** fusion + mid markout

* subscribe to / poll the CLOB book for tokens we're seeing on-chain fills in; maintain a current mid per tokenId (and its timestamp).
* TIME ALIGNMENT (load-bearing – the settlement-lag problem):

  * on-chain block_timestamp is SETTLEMENT time, which lags the off-chain match
  * fill-time mid (mid at/near the match) and mid at match + ∆
  * Use the CLOB book timestamps, not the chain settlement time, as the mid clock. Measure and REPORT the settlement-vs-mid-clock offset empirically (this is the error-budget number Stage 1 left a TODO spot for)
* Recompute maker-side markout against the MID: maker\_markout(∆) = -s • (mid\_{t+∆} – fill_price), same sign convention as Stage 2 (negative --> maker adversely selected).



### **Build #2 Results (Task B):**

The build succeeded – the mid removed the spread artifact. The worked example is clean – same fill, proxy markout + 5.0¢, mid markout + 6.5¢, and the -1.5¢ difference is the bid/ask print artifact the mid strips out.

The mechanism I'd hypothesized (trade-price prints at bid/ask, conflating spread with adverse selection) is confirmed and rm. The mid produces a stable median of +0.500¢ at every horizon, every run – vs the proxy's median ~0 with a sign that flipped each run.

**The stable signal is +0.50¢/share – positive – meaning the typical maker is NOT net adversely selected.** They're capturing roughly half the spread, which is what a healthy market-maker is SUPPOSED to earn. A positive maker-side markout means the **LP comes out ahead at the typical fill. So the headline finding from live Polymarket is...**

***typical LP is not getting picked off – they're earning the spread, as designed***

This isn't what my simulation had predicted (the ~13σ AS result), and it's not what the company thesis had assumed ("LPs bleed to informed flow, sell them a neutral clearing layer".)

#### **Why the thesis still works >**

the signal isn't uniformly "No adverse selection" 

1. the mean is tail-dominated and sign-unstable (∆30 mean ranges -0.2¢ to +3.8¢ across runs). The median is +0.5 and stable, but the mean swings – which means a few large-move fills carry heavy adverse selection even though the typical fill doesn't

   * in other words: most fills are benign spread capture, but there's a heavy tail of fills where the maker got run over
2. The direction asymmetry is consistent across runs: BOUGHT positive, SOLD negative – aggressive selling adversely-selects makers more than aggressive buying. That's a reputable signature, small-n and noisy, but directionally stable.



**At the typical fill price, Polymarket LPs are not adversely selected; they earn ~half the spread. Adverse selection is real but lives in a heavy tail of large-move fills and shows up as a persistent aggressive-sell=side negativity. Broad net extraction is not present in these windows.**





### Build #3 – per-maker attribution

per-maker / per-address adverse-selection attribution. At this point, Builds 0-2 are committed (verified contracts, ground-truth decode + de-duplication, corrected mint/merge direction mid-based markout).

Build #2's aggregate said the TYPICAL maker is NOT broadly adversely selected (stable +0.5¢/share median = half-tick spread capture), BUT adverse selection is real and CONCENTRATED – a heavy tail (drives an unstable mean) + a persistent aggressive-SELL-side negativity. The aggregate hides the distribution. This build answers the one question that decides whether there's a viable business model: *does the tail extraction CONCENTRATE on identifiable, specific market-makers (--> a customer) or SMEAR across everyone (--> the +0.5¢ median is the whole story, no concentrated extraction)?*



### **Build 3 Results: concentrated AS/extraction**



It's not a smear, it's **bimodal**. The distribution of medians erodes and widens with horizon: at ∆30 you get 29 makers with medians < -1¢ AND 33 makers ≥ +1.5¢, distinct from the +0.5¢ spread-capture bulk. \~40 of \~109 qualifying makers carry **persistently negative, horizon-deepening medians** – separable from the bulk.
