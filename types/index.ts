export interface TaskRun {
  task_id: string;
  runtime: string;
  task_kind: string | null;
  source_id: string | null;
  owner_key: string;
  scope_kind: string;
  run_id: string | null;
  label: string | null;
  task: string;
  status: string;
  delivery_status: string;
  created_at: number;
  started_at: number | null;
  ended_at: number | null;
  error: string | null;
  progress_summary: string | null;
  terminal_summary: string | null;
  terminal_outcome: string | null;
}

export interface MdTask {
  id: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'done';
  owner?: string;
}

export interface Task {
  id: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'done' | 'running' | 'failed' | 'cancelled' | 'pending';
  owner?: string;
  createdAt?: number;
  source: 'sqlite' | 'markdown';
  label?: string | null;
  terminalOutcome?: string | null;
}

export interface Project {
  slug: string;
  name: string;
  status: string;
  goal: string;
  whatMoving: string;
  nextActions: string[];
}
