import fs from 'fs';
import path from 'path';
import os from 'os';
import matter from 'gray-matter';
import type { Project } from '@/types';

const PROJECTS_DIR = path.join(os.homedir(), '.openclaw/workspace/projects');

function parseNextActions(content: string): string[] {
  const lines = content.split('\n');
  const actions: string[] = [];
  let inNextActions = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '## Next actions') {
      inNextActions = true;
    } else if (trimmed.startsWith('## ')) {
      inNextActions = false;
    } else if (inNextActions && trimmed.startsWith('- ')) {
      actions.push(trimmed.slice(2).trim());
    }
  }

  return actions;
}

function parseWhatMoving(content: string): string {
  const lines = content.split('\n');
  const paragraphs: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '## What\'s moving') {
      inSection = true;
    } else if (trimmed.startsWith('## ')) {
      inSection = false;
    } else if (inSection && trimmed) {
      paragraphs.push(trimmed);
    }
  }

  return paragraphs.join(' ');
}

export function getProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.md'));
  const projects: Project[] = [];

  for (const file of files) {
    const filePath = path.join(PROJECTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    projects.push({
      slug: file.replace('.md', ''),
      name: data.name || file.replace('.md', ''),
      status: data.status || 'unknown',
      goal: data.goal || '',
      whatMoving: parseWhatMoving(content),
      nextActions: parseNextActions(content),
    });
  }

  return projects;
}
