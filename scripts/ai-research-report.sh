#!/bin/bash
# Daily AI Infrastructure Research Report — triggered at 9am AWST (1am UTC)

/usr/local/bin/openclaw agent \
  --agent finn \
  --deliver \
  --reply-channel discord \
  --reply-to "1521512391962005707" \
  --message "Run the daily AI infrastructure research report and send it to Discord channel 1521512391962005707.

Use the brave-web-search skill for news and the stock-market-pro skill for price data.

BEFORE DRAFTING: verify the current date and status of any events you plan to mention. If something has already happened, state it with the actual date. If a date is uncertain, flag it as 'unconfirmed'. Never write predictive language like 'earnings in ~48 hours' for events that may have already occurred.

---
TARGET STRUCTURE (follow exactly, include only sections with new content):

**AI Infrastructure Daily — [DATE]**
Thesis health: [solid / cautious / watch closely] | Next catalyst: [event + verified date, or 'unconfirmed']

**CORE HOLDINGS**
Table format only: Ticker | Price | % Change | One-line driver
Tickers: DRAM, VGS.AX, NDQ.AX, AMZN. No other tickers in this table.

**WHAT'S NEW TODAY** (3-5 bullets max)
Actual new developments from the past 24 hours only. No routine price moves. No static data (market cap, PE, EPS) unless materially changed.
Each bullet = one complete, self-contained thought. No merged sentences. No bolded header with no content underneath.
Each fact appears exactly once in the entire report. Do not repeat the same news item in another section.
Include Micron (MU), SK Hynix, or Samsung ONLY if there is a genuinely material development affecting the DRAM ETF thesis (major earnings surprise, HBM pricing shift, capacity change). Skip entirely on days with nothing material.

**SIGNALS**
Use emoji color tags. Plain text labels do not count.
🟢 [thesis-positive: capex increases, HBM price firming, new AI chip design wins, fab expansion]
🟡 [watch items: mixed signals, early-stage, unconfirmed]
🔴 [thesis risks: capex cuts, pricing collapses, demand warnings, China/CXMT supply ramp]
Separate macro noise (market selloffs, profit-taking) from genuine thesis signals. Each item listed once only.

**NEXT CATALYST** (one item only, verified date or flagged unconfirmed)

**MICRON / SK HYNIX / SAMSUNG** (include this section only if materially relevant today)

---
PRE-SEND CHECKLIST (run before sending):
- Any merged or broken bullets?
- Any fact repeated across sections?
- Color emoji present in signals section?
- Any unverified predictive language?
- Length appropriate? Drop Broader AI Buildout and Tech News Roundup unless directly thesis-relevant.

Tone: factual, plain English, no spin, no em dashes. Define jargon inline on first use."
