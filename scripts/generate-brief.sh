#!/bin/bash
# Morning brief generator — writes to Desktop/morning-brief.txt for send-brief.sh

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export GOG_KEYRING_PASSWORD=$(cat /Users/kennyngoo/.config/gog/.keyring_pass)

BRIEF_FILE="/Users/kennyngoo/Desktop/morning-brief.txt"
PRIORITIES_FILE="/Users/kennyngoo/mission-control/priorities.txt"
ACCOUNT="kenny.titanmail@gmail.com"
PERSONAL_ACCOUNT="kennyngdoubleo@gmail.com"
TODAY=$(date "+%A, %-d %B")
TODAY_ISO=$(date "+%Y-%m-%d")

OUT="☀️ Morning Brief — $TODAY\n\n"

# 1. Top 3 priorities
if [ -f "$PRIORITIES_FILE" ]; then
  COUNT=0
  PLINES=""
  while IFS= read -r line && [ $COUNT -lt 3 ]; do
    [ -z "$line" ] && continue
    PLINES+="• $line\n"
    COUNT=$((COUNT + 1))
  done < "$PRIORITIES_FILE"
  if [ -n "$PLINES" ]; then
    OUT+="📌 Priorities\n${PLINES}\n"
  fi
fi

SN_JOBS_CAL="34olllvu6977su4ah3d4tsh9os@group.calendar.google.com"

# 2. Calendar events today (Google: primary + SN Jobs; Apple: Home, Work, Family, Shoots)
EVENTS_PRIMARY=$(gog calendar events primary \
  --from "${TODAY_ISO}T00:00:00+08:00" \
  --to "${TODAY_ISO}T23:59:59+08:00" \
  --account "$PERSONAL_ACCOUNT" 2>/dev/null)
EVENTS_SN=$(gog calendar events "$SN_JOBS_CAL" \
  --from "${TODAY_ISO}T00:00:00+08:00" \
  --to "${TODAY_ISO}T23:59:59+08:00" \
  --account "$PERSONAL_ACCOUNT" 2>/dev/null)
EVENTS_APPLE=$(osascript <<'APPLESCRIPT' 2>/dev/null
set todayStart to current date
set time of todayStart to 0
set todayEnd to todayStart + 86399
set appleCalendars to {"Home", "Work", "Family", "Shoots"}
set results to {}
tell application "Calendar"
  repeat with calName in appleCalendars
    try
      set cal to calendar calName
      set evts to (every event of cal whose start date >= todayStart and start date <= todayEnd)
      repeat with e in evts
        set end of results to (summary of e)
      end repeat
    end try
  end repeat
end tell
set output to ""
repeat with r in results
  set output to output & r & linefeed
end repeat
return output
APPLESCRIPT
)
EVENTS_ALL=$(
  { [ -n "$EVENTS_PRIMARY" ] && echo "$EVENTS_PRIMARY" | tail -n +2; }
  { [ -n "$EVENTS_SN" ] && echo "$EVENTS_SN" | tail -n +2; }
)
CAL_LINES=""
if [ -n "$EVENTS_ALL" ]; then
  while IFS= read -r line; do
    [ -n "$line" ] && CAL_LINES+="• $line"$'\n'
  done < <(echo "$EVENTS_ALL" | awk '{$1=$2=$3=""; sub(/^[[:space:]]+/, ""); if ($0!="") print $0}')
fi
if [ -n "$EVENTS_APPLE" ]; then
  while IFS= read -r line; do
    [ -n "$line" ] && CAL_LINES+="• $line"$'\n'
  done <<< "$EVENTS_APPLE"
fi
if [ -n "$CAL_LINES" ]; then
  OUT+="📅 Today\n${CAL_LINES}\n"
fi

# 3. Weather — Treeby
WEATHER=$(curl -s --max-time 5 "wttr.in/Treeby?format=3" 2>/dev/null)
[ -n "$WEATHER" ] && OUT+="🌤 ${WEATHER}\n\n"

# 4. Urgent unread emails (exclude already summarised)
URGENT=$(gog gmail search \
  'is:unread label:inbox -label:Summarized (urgent OR ASAP OR deadline OR "action required" OR "final notice")' \
  --account "$ACCOUNT" --max 3 2>/dev/null \
  | tail -n +2 | awk -F'\t' 'NF>3 && $4!="" {print "• " $4}' | head -3)
[ -n "$URGENT" ] && OUT+="🚨 Urgent\n${URGENT}\n\n"

printf "%b" "$OUT" > "$BRIEF_FILE"
