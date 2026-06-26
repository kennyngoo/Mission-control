import type { Task } from '@/types';
import TaskCard from './task-card';

interface Column {
  key: string;
  label: string;
  tasks: Task[];
  accentColor: string;
}

function EmptyState() {
  return (
    <p
      style={{
        fontSize: '12px',
        color: '#334155',
        padding: '16px 0',
        textAlign: 'center',
        fontStyle: 'italic',
      }}
    >
      no tasks yet
    </p>
  );
}

function ColumnHeader({
  label,
  count,
  accentColor,
}: {
  label: string;
  count: number;
  accentColor: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        paddingBottom: '10px',
        borderBottom: '1px solid #1e2435',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: '#94a3b8',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          backgroundColor: '#1e2435',
          color: accentColor,
          fontSize: '11px',
          fontWeight: 700,
          padding: '1px 7px',
          borderRadius: '10px',
          minWidth: '24px',
          textAlign: 'center',
          fontFamily: 'monospace',
        }}
      >
        {count}
      </span>
    </div>
  );
}

export default function TaskBoard({
  backlog,
  inProgress,
  done,
  failed,
}: {
  backlog: Task[];
  inProgress: Task[];
  done: Task[];
  failed: Task[];
}) {
  const columns: Column[] = [
    { key: 'backlog', label: 'Backlog', tasks: [...backlog], accentColor: '#64748b' },
    {
      key: 'inProgress',
      label: 'In Progress',
      tasks: [...inProgress],
      accentColor: '#a78bfa',
    },
    {
      key: 'done',
      label: 'Done',
      tasks: [...done.slice(0, 30)],
      accentColor: '#4ade80',
    },
  ];

  if (failed.length > 0) {
    columns.push({ key: 'failed', label: 'Failed / Cancelled', tasks: failed, accentColor: '#f87171' });
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
        gap: '16px',
        alignItems: 'start',
      }}
    >
      {columns.map(col => (
        <div
          key={col.key}
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1e2435',
            borderRadius: '10px',
            padding: '16px',
            minHeight: '200px',
          }}
        >
          <ColumnHeader label={col.label} count={col.tasks.length} accentColor={col.accentColor} />
          {col.tasks.length === 0 ? (
            <EmptyState />
          ) : (
            col.tasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      ))}
    </div>
  );
}
