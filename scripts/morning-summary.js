#!/usr/bin/env node
// Morning inbox summary for kenny.titanmail@gmail.com
// Delivered to Telegram via OpenClaw exec output

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Load .env.local if env vars not already set (cron isolated context)
const ENV_PATH = path.join(os.homedir(), 'mission-control', '.env.local');
if (fs.existsSync(ENV_PATH)) {
  const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}

const GMAIL_TOKENS_PATH = path.join(os.homedir(), 'mission-control', '.google-gmail-tokens.json');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_GMAIL_REDIRECT_URI || 'http://localhost:3000/api/auth/gmail/callback';

function loadTokens() {
  try {
    if (!fs.existsSync(GMAIL_TOKENS_PATH)) return null;
    return JSON.parse(fs.readFileSync(GMAIL_TOKENS_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function saveTokens(tokens) {
  const existing = loadTokens() || {};
  fs.writeFileSync(GMAIL_TOKENS_PATH, JSON.stringify({ ...existing, ...tokens }, null, 2));
}

async function getGmailClient() {
  const tokens = loadTokens();
  if (!tokens) throw new Error('Gmail not authenticated. Visit http://localhost:3000/api/auth/gmail to connect.');

  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  auth.setCredentials(tokens);
  auth.on('tokens', saveTokens);
  return google.gmail({ version: 'v1', auth });
}

async function ensureLabel(gmail, name) {
  const res = await gmail.users.labels.list({ userId: 'me' });
  const existing = res.data.labels?.find(l => l.name === name);
  if (existing) return existing.id;

  const created = await gmail.users.labels.create({
    userId: 'me',
    requestBody: { name, labelListVisibility: 'labelShow', messageListVisibility: 'show' },
  });
  return created.data.id;
}

function decodeBody(part) {
  if (!part) return '';
  const data = part.body?.data || '';
  if (!data) return '';
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractText(payload) {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain') return decodeBody(payload);
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractText(part);
      if (text) return text;
    }
  }
  return '';
}

function getHeader(headers, name) {
  return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function truncate(text, maxLen = 300) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + '...' : clean;
}

function isReplyNeeded(subject, body, from) {
  const replyPatterns = [
    /\?/,
    /please (reply|respond|confirm|let me know)/i,
    /can you/i,
    /could you/i,
    /would you/i,
    /are you (available|free|able)/i,
    /following up/i,
    /waiting (for|on) (your|a)/i,
    /action required/i,
  ];
  const combined = `${subject} ${body}`;
  return replyPatterns.some(p => p.test(combined));
}

function isUrgent(subject, body, from) {
  const urgentPatterns = [
    /urgent/i,
    /asap/i,
    /immediately/i,
    /time.sensitive/i,
    /deadline/i,
    /overdue/i,
    /payment.*(failed|declined|due)/i,
    /invoice.*(overdue|unpaid)/i,
    /legal/i,
    /final notice/i,
  ];
  const combined = `${subject} ${body}`;
  return urgentPatterns.some(p => p.test(combined));
}

function categorise(thread) {
  const { subject, from, body } = thread;
  const combined = `${subject} ${from} ${body}`;

  if (/booking|enquir|inquiry|wedding|quote|availability/i.test(combined)) return 'Enquiries';
  if (/invoice|payment|receipt|paid|xero|stripe|square/i.test(combined)) return 'Finance';
  if (/contract|agreement|terms|sign/i.test(combined)) return 'Contracts';
  if (/delivery|gallery|album|sneak peek|images|photos/i.test(combined)) return 'Deliveries';
  if (/ndis|participant|support|plan|funding/i.test(combined)) return 'NDIS';
  if (/newsletter|unsubscribe|promo|deal|offer|marketing/i.test(combined)) return 'Marketing';
  if (/noreply|no-reply|automated|notification|alert/i.test(combined)) return 'Notifications';
  return 'General';
}

async function main() {
  let gmail;
  try {
    gmail = await getGmailClient();
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }

  const summarisedLabelId = await ensureLabel(gmail, 'Summarized');

  // Fetch threads in INBOX not yet labelled as Summarized
  const listRes = await gmail.users.threads.list({
    userId: 'me',
    labelIds: ['INBOX'],
    q: `-label:Summarized`,
    maxResults: 50,
  });

  const threads = listRes.data.threads || [];

  if (threads.length === 0) {
    console.log('Morning inbox is clear. Nothing new to summarise.');
    process.exit(0);
  }

  // Fetch full thread data
  const threadData = await Promise.all(
    threads.map(t =>
      gmail.users.threads.get({ userId: 'me', id: t.id, format: 'full' })
        .then(r => r.data)
        .catch(() => null)
    )
  );

  const parsed = threadData
    .filter(Boolean)
    .map(thread => {
      const msg = thread.messages?.[0];
      if (!msg) return null;
      const headers = msg.payload?.headers || [];
      const subject = getHeader(headers, 'subject') || '(no subject)';
      const from = getHeader(headers, 'from') || 'Unknown';
      const date = getHeader(headers, 'date') || '';
      const body = extractText(msg.payload);
      return {
        threadId: thread.id,
        subject,
        from,
        date,
        body,
        messageCount: thread.messages?.length || 1,
        category: categorise({ subject, from, body }),
        urgent: isUrgent(subject, body, from),
        replyNeeded: isReplyNeeded(subject, body, from),
      };
    })
    .filter(Boolean);

  const urgent = parsed.filter(t => t.urgent);
  const replyNeeded = parsed.filter(t => !t.urgent && t.replyNeeded);
  const byCategory = {};
  for (const t of parsed) {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  }

  // Build summary output
  const lines = [];
  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Australia/Perth',
  });

  lines.push(`Good morning Kenny. Here's your inbox for ${today}.`);
  lines.push(`${parsed.length} unread thread${parsed.length !== 1 ? 's' : ''}.`);
  lines.push('');

  if (urgent.length > 0) {
    lines.push(`🚨 URGENT (${urgent.length})`);
    for (const t of urgent) {
      lines.push(`• ${t.subject}`);
      lines.push(`  From: ${t.from}`);
      lines.push(`  ${truncate(t.body, 200)}`);
    }
    lines.push('');
  }

  if (replyNeeded.length > 0) {
    lines.push(`💬 Needs reply (${replyNeeded.length})`);
    for (const t of replyNeeded) {
      lines.push(`• ${t.subject}`);
      lines.push(`  From: ${t.from}`);
      lines.push(`  ${truncate(t.body, 150)}`);
    }
    lines.push('');
  }

  const categoryOrder = ['Enquiries', 'Finance', 'Contracts', 'Deliveries', 'NDIS', 'General', 'Notifications', 'Marketing'];
  const remainingCats = [
    ...categoryOrder.filter(c => byCategory[c] && byCategory[c].some(t => !t.urgent && !t.replyNeeded)),
    ...Object.keys(byCategory).filter(c => !categoryOrder.includes(c)),
  ];

  for (const cat of remainingCats) {
    const items = (byCategory[cat] || []).filter(t => !t.urgent && !t.replyNeeded);
    if (!items.length) continue;
    lines.push(`📂 ${cat} (${items.length})`);
    for (const t of items) {
      lines.push(`• ${t.subject} — ${t.from.replace(/<.*>/, '').trim()}`);
    }
    lines.push('');
  }

  const summary = lines.join('\n').trim();
  console.log(summary);

  // Apply "Summarized" label to all threads
  await Promise.all(
    parsed.map(t =>
      gmail.users.threads.modify({
        userId: 'me',
        id: t.threadId,
        requestBody: { addLabelIds: [summarisedLabelId] },
      }).catch(() => null)
    )
  );
}

main().catch(err => {
  console.error('Morning summary failed:', err.message);
  process.exit(1);
});
