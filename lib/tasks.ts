import fs from 'fs';
import path from 'path';
import os from 'os';
import matter from 'gray-matter';
import type { Task, TaskRun, MdTask } from '@/types';

const TASKS_MD_PATH = path.join(os.homedir(), '.openclaw/workspace/tasks.md');

function normalizeSqliteStatus(status: string): Task['status'] {
  switch (status.toLowerCase()) {
    case 'running':
    case 'in_progress':
    case 'in-progress':
      return 'running';
    case 'done':
    case 'completed':
    case 'success':
    case 'succeeded':
      return 'done';
    case 'failed':
    case 'error':
      return 'failed';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'pending':
    case 'queued':
      return 'pending';
    default:
      return 'backlog';
  }
}

function parseMdTasks(): MdTask[] {
  if (!fs.existsSync(TASKS_MD_PATH)) return [];

  const raw = fs.readFileSync(TASKS_MD_PATH, 'utf-8');
  const { content } = matter(raw);
  const tasks: MdTask[] = [];

  let currentStatus: MdTask['status'] = 'backlog';
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '## Backlog') {
      currentStatus = 'backlog';
    } else if (trimmed === '## In Progress') {
      currentStatus = 'in-progress';
    } else if (trimmed === '## Done') {
      currentStatus = 'done';
    } else if (trimmed.startsWith('- ')) {
      const text = trimmed.slice(2).trim();
      const ownerMatch = text.match(/\[owner:\s*([^\]]+)\]/i);
      const owner = ownerMatch ? ownerMatch[1].trim() : undefined;
      const description = text.replace(/\[owner:\s*[^\]]+\]/i, '').trim();

      if (description) {
        tasks.push({
          id: `md-${Date.now()}-${Math.random()}`,
          description,
          status: currentStatus,
          owner,
        });
      }
    }
  }

  return tasks;
}

export function getTasks(): Task[] {
  const tasks: Task[] = [];

  // Read from SQLite
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const rows = db.prepare(
      'SELECT task_id, run_id, label, task, status, created_at, terminal_outcome FROM task_runs ORDER BY created_at DESC LIMIT 200'
    ).all() as TaskRun[];
    db.close();

    for (const row of rows) {
      tasks.push({
        id: row.task_id,
        description: row.task,
        status: normalizeSqliteStatus(row.status),
        owner: row.owner_key || undefined,
        createdAt: row.created_at,
        source: 'sqlite',
        label: row.label,
        terminalOutcome: row.terminal_outcome,
      });
    }
  } catch {
    // DB may not exist or be inaccessible
  }

  // Read from tasks.md
  const mdTasks = parseMdTasks();
  for (const mt of mdTasks) {
    tasks.push({
      id: mt.id,
      description: mt.description,
      status: mt.status,
      owner: mt.owner,
      source: 'markdown',
    });
  }

  return tasks;
}

export function getTasksByStatus() {
  const all = getTasks();
  return {
    backlog: all.filter(t => t.status === 'backlog' || t.status === 'pending'),
    inProgress: all.filter(t => t.status === 'in-progress' || t.status === 'running'),
    done: all.filter(t => t.status === 'done'),
    failed: all.filter(t => t.status === 'failed' || t.status === 'cancelled'),
  };
}
