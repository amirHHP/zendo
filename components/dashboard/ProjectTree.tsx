'use client';

import React, { useState } from 'react';
import { ProjectItem } from '@/types';

interface ProjectTreeProps {
  projects: ProjectItem[];
  activeView: string;
  onSelectProject: (projectId: string) => void;
  onToggleExpand: (projectId: string) => void;
  onAddSubproject: (parentId: string, name: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export function ProjectTree({
  projects,
  activeView,
  onSelectProject,
  onToggleExpand,
  onAddSubproject,
  onDeleteProject,
}: ProjectTreeProps) {
  const rootProjects = projects.filter((p) => !p.parentId);

  if (rootProjects.length === 0) {
    return (
      <div className="help-text" style={{ padding: '12px 6px', textAlign: 'center' }}>
        هنوز پروژه‌ای اضافه نشده است.
      </div>
    );
  }

  return (
    <div className="projects-tree">
      {rootProjects.map((project) => (
        <ProjectNode
          key={project.id}
          project={project}
          allProjects={projects}
          activeView={activeView}
          onSelectProject={onSelectProject}
          onToggleExpand={onToggleExpand}
          onAddSubproject={onAddSubproject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </div>
  );
}

interface ProjectNodeProps {
  project: ProjectItem;
  allProjects: ProjectItem[];
  activeView: string;
  onSelectProject: (projectId: string) => void;
  onToggleExpand: (projectId: string) => void;
  onAddSubproject: (parentId: string, name: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
}

function ProjectNode({
  project,
  allProjects,
  activeView,
  onSelectProject,
  onToggleExpand,
  onAddSubproject,
  onDeleteProject,
}: ProjectNodeProps) {
  const children = allProjects.filter((p) => p.parentId === project.id);
  const hasChildren = children.length > 0;
  const isExpanded = project.expanded !== false;
  const isActive = activeView === project.id;

  const [isAddingSub, setIsAddingSub] = useState(false);
  const [subName, setSubName] = useState('');

  const handleCreateSub = async () => {
    const trimmed = subName.trim();
    if (trimmed) {
      await onAddSubproject(project.id, trimmed);
    }
    setSubName('');
    setIsAddingSub(false);
  };

  return (
    <div className="project-node" data-id={project.id}>
      <div
        className={`project-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelectProject(project.id)}
      >
        <span
          className={`project-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              onToggleExpand(project.id);
            }
          }}
        >
          {hasChildren ? '▶' : ''}
        </span>

        <span className="project-name" title={project.name}>
          {project.name}
        </span>

        <div className="project-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="text-button"
            title="افزودن زیرپروژه"
            onClick={() => {
              if (!isExpanded) {
                onToggleExpand(project.id);
              }
              setIsAddingSub(true);
            }}
          >
            +
          </button>
          <button
            className="text-button danger"
            title="حذف پروژه"
            onClick={() => {
              if (confirm(`آیا از حذف پروژه "${project.name}" اطمینان دارید؟`)) {
                onDeleteProject(project.id);
              }
            }}
          >
            &times;
          </button>
        </div>
      </div>

      <div className={`project-children ${isExpanded ? '' : 'collapsed'}`}>
        {children.map((child) => (
          <ProjectNode
            key={child.id}
            project={child}
            allProjects={allProjects}
            activeView={activeView}
            onSelectProject={onSelectProject}
            onToggleExpand={onToggleExpand}
            onAddSubproject={onAddSubproject}
            onDeleteProject={onDeleteProject}
          />
        ))}

        {isAddingSub && (
          <div style={{ padding: '4px 6px', display: 'flex' }}>
            <input
              type="text"
              placeholder="نام زیرپروژه..."
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSub();
                if (e.key === 'Escape') setIsAddingSub(false);
              }}
              onBlur={handleCreateSub}
              autoFocus
              style={{
                border: 'none',
                borderBottom: '1px solid var(--text-primary)',
                background: 'transparent',
                width: '100%',
                fontSize: '11px',
                fontFamily: 'var(--font-family)',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
