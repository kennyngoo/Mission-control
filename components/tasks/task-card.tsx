import type { Task } from '@/types';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  backlog: { bg: '#1e2435', color: '#64748b', label: 'BACKLOG' },
  pending: { bg: '#1e2435', color: '#64748b', label: 'PENDING' },
  'in-progress': { bg: '#2d1b69', color: '#a78bfa', label: 'IN-PROGRESS' },
  running: { bg: '#2d1b69', color: '#a78bfa', label: 'RUNNING' },
  done: { bg: '#14532d', color: '#4ade80', label: 'DONE' },
  failed: { bg: '#450a0a', color: '#f87171', label: 'FAILED' },
  cancelled: { bg: '#1c1917', color: '#78716c', label: 'CANCELLED' },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.backlog;
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        padding: '2px 7px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
      }}
    >
      {style.label}
    </span>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts < 1e12 ? ts * 1000 : ts);
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div
      style={{
        backgroundColor: '#1a1f2e',
        border: '1px solid #1e2435',
        borderRadius: '8px',
        padding: '12px 14px',
        marginBottom: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* source indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '3px 7px',
          fontSize: '9px',
          color: '#334155',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        {task.source === 'sqlite' ? 'db' : 'md'}
      </div>

      <p
        style={{
          margin: '0 0 10px',
          fontSize: '13px',
          color: '#cbd5e1',
          lineHeight: '1.5',
          paddingRight: '20px',
        }}
      >
        {task.label ? (
          <span style={{ fontWeight: 600, color: '#e2e8f0', marginRight: '6px' }}>
            {task.label}
          </span>
        ) : null}
        {task.description.length > 120
          ? task.description.slice(0, 120) + '…'
          : task.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <StatusBadge status={task.status} />

        {task.owner && (
          <span
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              backgroundColor: '#0f172a',
              padding: '2px 7px',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          >
            {task.owner}
          </span>
        )}

        {task.createdAt && (
          <span style={{ fontSize: '11px', color: '#475569', marginLeft: 'auto' }}>
            {formatDate(task.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
