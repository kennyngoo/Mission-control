#!/usr/bin/env node
// Labels every inbox thread as Summarized to clear the backlog.
// Run once: node ~/mission-control/scripts/label-all-summarized.js

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ENV_PATH = path.join(os.homedir(), 'mission-control', '.env.local');
if (fs.existsSync(ENV_PATH)) {
  const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

const TOKENS_PATH = path.join(os.homedir(), 'mission-control', '.google-gmail-tokens.json');
const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_GMAIL_REDIRECT_URI
);
auth.setCredentials(tokens);
auth.on('tokens', t => {
  const existing = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
  fs.writeFileSync(TOKENS_PATH, JSON.stringify({ ...existing, ...t }, null, 2));
});
const gmail = google.gmail({ version: 'v1', auth });

async function main() {
  // Ensure label exists
  const labelsRes = await gmail.users.labels.list({ userId: 'me' });
  let label = labelsRes.data.labels?.find(l => l.name === 'Summarized');
  if (!label) {
    const created = await gmail.users.labels.create({
      userId: 'me',
      requestBody: { name: 'Summarized', labelListVisibility: 'labelShow', messageListVisibility: 'show' },
    });
    label = created.data;
  }
  const labelId = label.id;

  let pageToken;
  let total = 0;
  let page = 0;

  do {
    const res = await gmail.users.threads.list({
      userId: 'me',
      q: '-label:Summarized',
      maxResults: 100,
      ...(pageToken ? { pageToken } : {}),
    });

    const threads = res.data.threads || [];
    pageToken = res.data.nextPageToken;
    page++;

    if (threads.length === 0) break;

    await Promise.all(
      threads.map(t =>
        gmail.users.threads.modify({
          userId: 'me',
          id: t.id,
          requestBody: { addLabelIds: [labelId] },
        }).catch(() => null)
      )
    );

    total += threads.length;
    process.stdout.write(`\rLabelled ${total} threads...`);
  } while (pageToken);

  console.log(`\nDone. ${total} threads marked as Summarized.`);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
