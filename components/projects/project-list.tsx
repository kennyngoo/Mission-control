import type { Project } from '@/types';
import ProjectCard from './project-card';

export default function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p
        style={{
          fontSize: '13px',
          color: '#334155',
          padding: '32px 0',
          textAlign: 'center',
        }}
      >
        no projects found — add .md files to ~/.openclaw/workspace/projects/
      </p>
    );
  }

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
