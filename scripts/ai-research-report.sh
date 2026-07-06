#!/bin/bash
# Daily AI Infrastructure Research Report — triggered at 9am AWST (1am UTC)

/usr/local/bin/openclaw agent \
  --agent finn \
  --deliver \
  --reply-channel discord \
  --reply-to "1521512391962005707" \
  --message "Run the daily AI infrastructure research report and send it to Discord channel 1521512391962005707.

Use the brave-web-search skill for news with freshness set to past day (pd). Use the stock-market-pro skill for price data.

---

CRITICAL RULE — NO RECYCLED NEWS:
This report runs every day. The previous report already covered standing facts. Do NOT repeat them.

These items have already been reported and must NOT appear again unless there is a material new development:
- Micron Q3 FY2026 record results ($41.46B revenue, EPS $25.11, Q4 ~$50B guide)
- SK Hynix Nasdaq ADR listing (Jul 10, $29.4B raise) — once it lists, report the outcome; until then, do not repeat the announcement
- Samsung $648B / 1,000 trillion won 10-year investment plan
- Samsung + SK Hynix Chungcheong packaging fabs (392 trillion won)
- Hyperscaler combined capex figures ($700-725B in 2026) — only include if a new figure or cut is announced
- Mid-2027 HBM supply inflection — standing thesis context, not daily news
- DRAM price-fixing class action lawsuit — already reported; only include if there is a court ruling or material development
- Meta selling excess AI compute — already reported; only include if there is a new announcement or revenue figure
- $100B binding Micron HBM contracts — already reported
- Michael Burry short on MU — already reported

A fact is NEW only if it was published in the last 24 hours AND has not appeared in a prior report. If you are unsure whether something is new, skip it.

BEFORE DRAFTING: verify the current date. Check whether any event you plan to mention has already occurred. State completed events with their actual date. If a date is uncertain, write unconfirmed. Never write predictive language for events that may have already passed.

---

REPORT FORMAT (follow exactly):

**AI Infrastructure Daily — [DATE]**
Thesis health: [solid / cautious / watch closely] | Next catalyst: [event + verified date, or unconfirmed]

**CORE HOLDINGS**
Table only. Columns: Ticker | Price | % Change | One-line driver
Track exactly: DRAM, VGS.AX, NDQ.AX, AMZN. No other tickers in this table.

**WHAT'S NEW TODAY** (3-5 bullets max)
New developments from the past 24 hours only. Each bullet is one complete, self-contained thought. No bullet merges two unrelated sentences. No bolded header with no content underneath it. Each fact appears exactly once in the entire report.
Include Micron (MU), SK Hynix, or Samsung only if there is a genuinely material new development: major earnings surprise, HBM pricing shift, capacity change, court ruling. Skip entirely on days with nothing new.

**SIGNALS**
🟢 Thesis-positive: capex increases, HBM price firming, new design wins, fab expansion confirmed.
🟡 Watch: mixed signals, early-stage, unconfirmed.
🔴 Thesis risk: capex cuts, HBM pricing collapse, demand warnings, China/CXMT supply ramp ahead of schedule.
Clearly separate macro noise (rebalancing, profit-taking, index selloffs) from genuine thesis signals. Each item listed once only. Nothing repeated from the news section.

**NEXT CATALYST** (one item, verified date or flagged unconfirmed)

**MICRON / SK HYNIX / SAMSUNG** (include only if there is genuinely new material news today; otherwise omit entirely)

---

PRE-SEND CHECKLIST (fix anything that fails before sending):
- Is every item in WHAT'S NEW TODAY actually from the last 24 hours?
- Does any item repeat something from the standing facts list above?
- Is any fact repeated across sections?
- Is color emoji present in SIGNALS?
- Are all bullets complete, self-contained thoughts with no merging?
- Is any predictive or unverified language present?

Tone: factual, plain English, no spin, no em dashes. Define any jargon inline on first use. Target length: concise. Omit any section with nothing genuinely new today."
