import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.openclaw/state/openclaw.sqlite');

export function getDb() {
  return new Database(DB_PATH, { readonly: true });
}
