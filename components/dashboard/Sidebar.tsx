'use client';

import React, { useState } from 'react';
import { ProjectItem } from '@/types';
import { ProjectTree } from './ProjectTree';

interface SidebarProps {
  inboxCount: number;
  activeView: string;
  projects: ProjectItem[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectInbox: () => void;
  onSelectProject: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddProject: (name: string) => Promise<void>;
  onAddSubproject: (parentId: string, name: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onOrganizeProjects: () => Promise<void>;
  isOrganizingProjects: boolean;
}

export function Sidebar({
  inboxCount,
  activeView,
  projects,
  isOpenMobile,
  onCloseMobile,
  onSelectInbox,
  onSelectProject,
  onToggleExpand,
  onAddProject,
  onAddSubproject,
  onDeleteProject,
  onOrganizeProjects,
  isOrganizingProjects,
}: SidebarProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [addingProject, setAddingProject] = useState(false);

  // Loose projects have parentId = null and no children
  const looseProjects = projects.filter(
    (p) => !p.parentId && !projects.some((child) => child.parentId === p.id)
  );
  const canOrganize = looseProjects.length > 15;

  const handleCreateProject = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = newProjectName.trim();
      if (!trimmed || addingProject) return;

      setAddingProject(true);
      try {
        await onAddProject(trimmed);
        setNewProjectName('');
      } finally {
        setAddingProject(false);
      }
    }
  };

  return (
    <>
      <div
        className={`mobile-sidebar-backdrop ${isOpenMobile ? 'mobile-open' : ''}`}
        onClick={onCloseMobile}
      />
      <aside className={`sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        <div
          className={`sidebar-item ${activeView === 'inbox' ? 'active' : ''}`}
          onClick={() => {
            onSelectInbox();
            onCloseMobile();
          }}
        >
          <span className="icon">📥</span>
          <span className="label">Inbox</span>
          {inboxCount > 0 && <span className="badge">{inboxCount}</span>}
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">PROJECTS</span>
            <button
              className="text-button"
              disabled={!canOrganize || isOrganizingProjects}
              onClick={onOrganizeProjects}
              title={
                canOrganize
                  ? 'دسته‌بندی هوشمند پروژه‌ها با هوش مصنوعی'
                  : 'برای استفاده از این قابلیت نیاز به بیش از ۱۵ پروژه بدون دسته‌بندی دارید'
              }
              style={{ fontSize: '11px' }}
            >
              {isOrganizingProjects ? 'در حال مرتب‌سازی...' : 'Organize'}
            </button>
          </div>

          <ProjectTree
            projects={projects}
            activeView={activeView}
            onSelectProject={(id) => {
              onSelectProject(id);
              onCloseMobile();
            }}
            onToggleExpand={onToggleExpand}
            onAddSubproject={onAddSubproject}
            onDeleteProject={onDeleteProject}
          />

          <div className="add-project-container">
            <input
              type="text"
              className="input-new-project"
              placeholder="+ New project..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={handleCreateProject}
              disabled={addingProject}
              autoComplete="off"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
