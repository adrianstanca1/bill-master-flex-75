import React from 'react';
import { SecurityStub } from './SecurityStub';

interface ProjectsOverviewProps {
  onViewProject?: (id: string) => void;
  onCreateProject?: () => void;
}

export function ProjectsOverview({ onViewProject, onCreateProject }: ProjectsOverviewProps) {
  return <SecurityStub title="Projects Overview" />;
}