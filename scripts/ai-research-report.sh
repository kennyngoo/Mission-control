#!/bin/bash
# Daily AI Infrastructure Research Report — triggered at 9am AWST (1am UTC)

/usr/local/bin/openclaw agent \
  --agent finn \
  --deliver \
  --reply-channel discord \
  --reply-to "1521512391962005707" \
  --message "Run the daily AI infrastructure research report and send it to Discord channel 1521512391962005707.

Use the brave-web-search skill for news and the stock-market-pro skill for price data.

Structure the report exactly as follows:

---
**AI Infrastructure Daily — $(date '+%A %-d %B %Y')**

**1. CORE HOLDINGS CHECK**
Run price quotes for: MU (Micron), 000660.KS (SK Hynix), 005930.KS (Samsung), DRAM (Roundhill Memory ETF), VGS, AMZN, NDQ.
Search for overnight news and analyst commentary on each. Focus on earnings, guidance, analyst upgrades/downgrades, and any DRAM/HBM-specific developments.

**2. HBM SUPPLY/DEMAND SIGNALS**
HBM = High Bandwidth Memory, the high-performance DRAM used in AI accelerators (e.g. Nvidia H100/H200/B200).
Search for: hyperscaler capex plans (Microsoft, Google, Amazon, Meta), HBM pricing or contract news, new fab capacity timelines. Flag anything relevant to the mid-2027 supply inflection point.

**3. BROADER AI BUILDOUT STOCKS**
Search for notable developments in AI supply chain companies: chips (NVDA, AMD, INTC, AVGO, MRVL, TSM), power/energy (VST, CEG, ETR, NRG), networking (ANET, NOK, CSCO), cooling/infrastructure (VRT, SMCI, DELL). Only include names with concrete competitive advantages — skip hype-driven mentions with no substance.

**4. TECH NEWS ROUNDUP**
Search for top tech news from the past 24 hours. For each item, add one line: 'Thesis relevance: [direct / indirect / none]' with a brief reason.

**5. SIGNAL VS NOISE**
Classify today's key developments:
🟢 GREEN — thesis-positive (capex increases, HBM price firming, new AI chip design wins, fab expansion confirmed)
🟡 AMBER — watch items (mixed signals, early-stage, unconfirmed)
🔴 RED — thesis risks (capex cuts, pricing collapses, demand warnings, substitute technology risk)
Clearly separate macro noise (broad market selloff, profit-taking, index rebalancing) from genuine thesis signals.

---
Tone: factual, plain English, no spin. Define any new jargon inline. End with one sentence on the overall thesis health today."
