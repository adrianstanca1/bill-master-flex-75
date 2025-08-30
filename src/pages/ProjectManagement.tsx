import { SmartProjectManager } from '@/components/SmartProjectManager';
import SEO from '@/components/SEO';

export default function ProjectManagement() {
  return (
    <>
      <SEO 
        title="Project Management - ASagents"
        description="Advanced project management tools for construction companies with Kanban boards and timeline tracking"
        keywords="project management, construction projects, kanban board, project tracking"
      />
      <div className="container mx-auto p-6">
        <SmartProjectManager />
      </div>
    </>
  );
}