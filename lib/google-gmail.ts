import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import os from 'os';

const GMAIL_TOKENS_PATH = path.join(os.homedir(), 'mission-control', '.google-gmail-tokens.json');

export function getGmailOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_GMAIL_REDIRECT_URI ?? 'http://localhost:3000/api/auth/gmail/callback'
  );
}

export function getGmailAuthUrl() {
  const client = getGmailOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    prompt: 'select_account consent',
    login_hint: 'kenny.titanmail@gmail.com',
  });
}

export function saveGmailTokens(tokens: object) {
  fs.writeFileSync(GMAIL_TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

export function loadGmailTokens(): object | null {
  try {
    if (!fs.existsSync(GMAIL_TOKENS_PATH)) return null;
    return JSON.parse(fs.readFileSync(GMAIL_TOKENS_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export function isGmailAuthenticated(): boolean {
  return loadGmailTokens() !== null;
}

export async function getAuthenticatedGmailClient() {
  const tokens = loadGmailTokens();
  if (!tokens) return null;

  const client = getGmailOAuthClient();
  client.setCredentials(tokens as Parameters<typeof client.setCredentials>[0]);

  client.on('tokens', (newTokens) => {
    const existing = loadGmailTokens() as Record<string, unknown> | null;
    saveGmailTokens({ ...(existing ?? {}), ...newTokens });
  });

  return google.gmail({ version: 'v1', auth: client });
}
