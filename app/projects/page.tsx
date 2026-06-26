import { getProjects } from '@/lib/projects';
import ProjectList from '@/components/projects/project-list';

export const revalidate = 10;

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: '900px' }}>
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
          Ventures
        </div>
        <h1
          style={{
            margin: '0 0 6px',
            fontSize: '28px',
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
          }}
        >
          📁 Projects
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''} · from ~/.openclaw/workspace/projects/
        </p>
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
