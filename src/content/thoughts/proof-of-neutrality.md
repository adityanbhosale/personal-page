---
title: proof of neutrality
topic: ATS structures
date: 2026-06-21T13:26:00
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
