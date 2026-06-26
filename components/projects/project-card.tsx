import type { Project } from '@/types';

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  active: { bg: '#14532d', color: '#4ade80' },
  paused: { bg: '#1c1917', color: '#78716c' },
  archived: { bg: '#0f172a', color: '#475569' },
  unknown: { bg: '#1e2435', color: '#64748b' },
};

export default function ProjectCard({ project }: { project: Project }) {
  const badge = STATUS_BADGE[project.status] ?? STATUS_BADGE.unknown;

  return (
    <div
      style={{
        backgroundColor: '#1a1f2e',
        border: '1px solid #1e2435',
        borderLeft: project.status === 'active' ? '3px solid #7c3aed' : '1px solid #1e2435',
        borderRadius: '10px',
        padding: '20px 24px',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '8px',
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.01em',
          }}
        >
          {project.name}
        </h2>
        <span
          style={{
            backgroundColor: badge.bg,
            color: badge.color,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '3px 9px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {project.status}
        </span>
      </div>

      {project.goal && (
        <p
          style={{
            margin: '0 0 16px',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.5',
          }}
        >
          {project.goal}
        </p>
      )}

      {project.whatMoving && (
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#475569',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Status
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
            {project.whatMoving}
          </p>
        </div>
      )}

      {project.nextActions.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#475569',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Next actions
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 0', listStyle: 'none' }}>
            {project.nextActions.map((action, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '5px',
                  fontSize: '13px',
                  color: '#94a3b8',
                  lineHeight: '1.4',
                }}
              >
                <span style={{ color: '#7c3aed', fontWeight: 700, marginTop: '1px', flexShrink: 0 }}>
                  →
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
