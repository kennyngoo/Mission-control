import { getTasksByStatus } from '@/lib/tasks';
import TaskBoard from '@/components/tasks/task-board';

export const revalidate = 10;

export default function TasksPage() {
  const { backlog, inProgress, done, failed } = getTasksByStatus();
  const total = backlog.length + inProgress.length + done.length + failed.length;

  return (
    <div style={{ padding: '32px 32px 48px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#475569',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          Operations
        </div>
        <h1
          style={{
            margin: '0 0 6px',
            fontSize: '28px',
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          ✅ Tasks
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
          {total} task{total !== 1 ? 's' : ''} total · synced from sqlite + tasks.md
        </p>
      </div>

      <TaskBoard
        backlog={backlog}
        inProgress={inProgress}
        done={done}
        failed={failed}
      />
    </div>
  );
}
