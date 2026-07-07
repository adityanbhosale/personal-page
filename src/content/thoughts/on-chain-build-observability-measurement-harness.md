---
title: "on-chain build: Observability/Measurement Harness"
topic: VSA Markets
date: 2026-07-07T08:53:00
---
VERA US



HORIZON

lisa kauffman

adam futterman





Liquidity is a solvable issue; go to banks for liquidity (banks with S&T desk just go to MMs to ask for what they can get for this); there is a lot opportunity in event markets for biotech. didn't trade that often with Leerink because he wasn't able to get good pricing... jake). look through electronic markets, go to banks, maybe even Leerink.. but probably not. prop trading vs. hedge funds vs. S&T desks (they're just relationship focused, they're they sell-side) 





**desk Feedback Summarized:**

* Single-catalyst event contracts is the VERY CLEAN ISOLATION OF CATALYSTS

  * very bad A/S
  * anyone who wants to trade a bespoke contract on one readout either has an information edge or is gambling, so a market maker has no uninformed flow to earn the spread against and no way to hedge the binary
  * slicing already thin interest into a more specific claim doesn't summon new participants; it concentrates the same small specialist pool into something even harder to make a two-sided market in.
* As a liquid trading venue – a place where a fund expects to move size and get filled – the desk is right. Adam's 5,000-contract order sitting on the screen is a live demonstration: no MM will warehouse that much binary catalyst risk unpaid without a natural buyer, so it has to walk the book to find one.



**Usman feedback summarized:**

* a synthetic spot creates an implied probability, but there's no guarantee anyone trades at those prices.

  * Layer 1 would produce the manipulation-resistant price, not executable depth. An LMSR is a pricing function – always quotes but the quote is firm only up to the subsidy-funded depth.
* S&T says biotech is too illiquid (i.e., Sellas options market one of the largest, still hard to find buyers, same for VERA US). This is correct for two-sided flow (no organic other side for a bespoke binary, and there won't be). *Usman says liquidity is solvable if you're creative in how you source it.*

  * S&T does this ... they don't cross client flow from their own books, they go to MMs and ask what they'll price it as. Liquidity in illiquid products is a dedicated risk warehouse being paid to exist, *not a crowd*.
  * You just need one professional LP to quote
  * How?

    * A single catalyst binary is unhedgeable and scary to a warehouse (inventory risk), no one would make that market if they're unpaid
    * BUT, a book of many uncorrelated catalyst events has largely idiosyncratic & diversifiable risk – a prop trading firm running 50 readouts isn't exposed to any single one, they're exposed to their average edge in pricing readouts
  * So to answer the liquidity issue: no single synthetic catalyst market needs to be deep if a professional LP runs a diversified book across all of them and earns the spread plus the market subsidy.
* Challenges:

  * XBI shifts can correlate catalysts, and informed flow concentrates on the readouts with the most edge – the LP's "diversified" book is actually very exposed to adverse selection.
  * LP can partially hedge a name that *has* listed options or a liquid equity; for a pure optionless small-cap they can't warehouse anything, so they might demand a spread so wide the market is thin-but-priced, not actually tradeable.

    * LP economics favor names with *some* hedgeable correlate – which is in contradiction with where I thought the market opportunity was (companies without strong or any options surface).
  * regulatory gate: HRT & Citadel will not designate-market-make on an unregulated testnet venue. The "go to prop firms" path is downstream of my Category 1 onshore posture, not available now.

    * in the meantime, i can create a pooled vault LP, which would act as the on-chain instantiation of the professional-LP-with-a-diversified-book.

**Player Framing:**

1. HFs (demand)
2. S&T Desks (distribution – sell-side, relationship-driven, source liquidyt rather than provide it, NOT THE LP)
3. Prop / electronic MMs are the liquidity – they'll actually warehouse these orders
4.
