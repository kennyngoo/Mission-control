import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TOKENS_PATH = path.join(os.homedir(), 'mission-control', '.google-tokens.json');

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl() {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    prompt: 'consent',
  });
}

export function saveTokens(tokens: object) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

export function loadTokens(): object | null {
  try {
    if (!fs.existsSync(TOKENS_PATH)) return null;
    return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return loadTokens() !== null;
}

export async function getCalendarEvents(timeMin: Date, timeMax: Date) {
  const tokens = loadTokens();
  if (!tokens) return null;

  const client = getOAuthClient();
  client.setCredentials(tokens as Parameters<typeof client.setCredentials>[0]);

  // Refresh and save updated tokens if needed
  client.on('tokens', (newTokens) => {
    const existing = loadTokens() as Record<string, unknown> | null;
    saveTokens({ ...(existing ?? {}), ...newTokens });
  });

  const calendar = google.calendar({ version: 'v3', auth: client });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  return res.data.items ?? [];
}
