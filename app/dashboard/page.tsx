'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TaskItem, ProjectItem, UserSettings } from '@/types';
import { Header } from '@/components/dashboard/Header';
import { QuickAdd } from '@/components/dashboard/QuickAdd';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TaskList } from '@/components/dashboard/TaskList';
import { TaskDetails } from '@/components/dashboard/TaskDetails';
import { SettingsModal } from '@/components/dashboard/SettingsModal';
import { ProModal } from '@/components/dashboard/ProModal';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        letterSpacing: '3px',
        fontWeight: '700',
      }}>
        ZENDO...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Application State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeView, setActiveView] = useState<string>('inbox');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    apiModel: 'gemini-2.5-flash',
    theme: 'light',
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // AI loading flags
  const [isElaboratingInbox, setIsElaboratingInbox] = useState(false);
  const [isOrganizingInbox, setIsOrganizingInbox] = useState(false);
  const [isOrganizingProjects, setIsOrganizingProjects] = useState(false);
  const [isElaboratingTask, setIsElaboratingTask] = useState(false);
  const [isOrganizingTask, setIsOrganizingTask] = useState(false);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Handle payment query params
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setBannerMessage({ text: 'تبریک! اشتراک پرو با موفقیت فعال شد. 🎉', type: 'success' });
    } else if (payment === 'failed') {
      setBannerMessage({ text: 'تراکنش ناموفق بود یا خطایی در تایید پرداخت رخ داد.', type: 'error' });
    } else if (payment === 'cancelled') {
      setBannerMessage({ text: 'پرداخت لغو گردید.', type: 'error' });
    }
  }, [searchParams]);

  // Initial data loading
  const loadData = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      setLoading(true);
      const [tasksRes, projectsRes, settingsRes] = await Promise.all([
        apiFetch('/api/tasks').then((r) => r.json()),
        apiFetch('/api/projects').then((r) => r.json()),
        apiFetch('/api/settings').then((r) => r.json()),
      ]);

      if (tasksRes.tasks) setTasks(tasksRes.tasks);
      if (projectsRes.projects) setProjects(projectsRes.projects);
      if (settingsRes.settings) setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quick Add task
  const handleAddTask = async (text: string) => {
    const targetProjectId = activeView === 'inbox' ? null : activeView;
    try {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, projectId: targetProjectId }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setIsProOpen(true);
        }
        alert(data.error || 'خطا در ثبت تسک');
        return;
      }

      setTasks((prev) => [data.task, ...prev]);
    } catch (err: any) {
      alert('خطا در ثبت تسک');
    }
  };

  // Toggle completion
  const handleToggleTaskCompleted = async (task: TaskItem) => {
    const newCompleted = !task.completed;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newCompleted } : t))
    );

    try {
      await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      });
    } catch (err) {
      console.error('Error updating task completion:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);

    try {
      await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Update task (text, notes, projectId, subtasks)
  const handleUpdateTask = async (id: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    try {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Projects CRUD
  const handleAddProject = async (name: string) => {
    try {
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setIsProOpen(true);
        }
        alert(data.error || 'خطا در ایجاد پروژه');
        return;
      }
      setProjects((prev) => [...prev, data.project]);
    } catch (err) {
      alert('خطا در ایجاد پروژه');
    }
  };

  const handleAddSubproject = async (parentId: string, name: string) => {
    try {
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setIsProOpen(true);
        }
        alert(data.error || 'خطا در ایجاد زیرپروژه');
        return;
      }
      setProjects((prev) => [...prev, data.project]);
    } catch (err) {
      alert('خطا در ایجاد زیرپروژه');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await apiFetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        const fallbackView = data.parentId || 'inbox';
        if (activeView === projectId) setActiveView(fallbackView);
        // Refresh projects and tasks
        loadData();
      }
    } catch (err) {
      alert('خطا در حذف پروژه');
    }
  };

  const handleToggleExpand = async (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const newExpanded = proj.expanded === false ? true : false;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, expanded: newExpanded } : p))
    );

    try {
      await apiFetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expanded: newExpanded }),
      });
    } catch (err) {
      console.error('Error toggling project expansion:', err);
    }
  };

  // AI: Elaborate Inbox
  const handleElaborateInbox = async () => {
    setIsElaboratingInbox(true);
    try {
      const res = await apiFetch('/api/ai/elaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inbox: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'خطا در هوش مصنوعی');
        return;
      }
      if (data.tasks) setTasks(data.tasks);
    } catch (err: any) {
      alert(err.message || 'خطا در بسط تسک‌های Inbox');
    } finally {
      setIsElaboratingInbox(false);
    }
  };

  // AI: Organize Inbox
  const handleOrganizeInbox = async () => {
    setIsOrganizingInbox(true);
    try {
      const res = await apiFetch('/api/ai/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inbox: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'خطا در سازماندهی Inbox');
        return;
      }
      if (data.tasks) setTasks(data.tasks);
      if (data.projects) setProjects(data.projects);
    } catch (err: any) {
      alert(err.message || 'خطا در سازماندهی Inbox');
    } finally {
      setIsOrganizingInbox(false);
    }
  };

  // AI: Organize Projects
  const handleOrganizeProjects = async () => {
    setIsOrganizingProjects(true);
    try {
      const res = await apiFetch('/api/ai/organize-projects', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'خطا در مرتب‌سازی پروژه‌ها');
        return;
      }
      if (data.projects) setProjects(data.projects);
    } catch (err: any) {
      alert(err.message || 'خطا در سازماندهی هوشمند پروژه‌ها');
    } finally {
      setIsOrganizingProjects(false);
    }
  };

  // AI: Single Task Elaborate
  const handleElaborateTask = async (taskId: string) => {
    setIsElaboratingTask(true);
    try {
      const res = await apiFetch('/api/ai/elaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'خطا در هوش مصنوعی');
        return;
      }
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
      }
    } catch (err: any) {
      alert(err.message || 'خطا در بسط تسک');
    } finally {
      setIsElaboratingTask(false);
    }
  };

  // AI: Single Task Organize
  const handleOrganizeTask = async (taskId: string) => {
    setIsOrganizingTask(true);
    try {
      const res = await apiFetch('/api/ai/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'خطا در سازماندهی تسک');
        return;
      }
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
      }
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (err: any) {
      alert(err.message || 'خطا در سازماندهی تسک');
    } finally {
      setIsOrganizingTask(false);
    }
  };

  // Settings Save
  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    const res = await apiFetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    const data = await res.json();
    if (data.settings) {
      setSettings(data.settings);
    }
  };

  // Filter tasks for active view
  const filteredTasks = tasks.filter((t) =>
    activeView === 'inbox' ? !t.projectId : t.projectId === activeView
  );

  const activeProject = projects.find((p) => p.id === activeView);
  const viewTitle = activeView === 'inbox' ? 'Inbox' : activeProject ? activeProject.name : 'Unknown Project';
  const inboxCount = tasks.filter((t) => !t.projectId && !t.completed).length;
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;
  const isPro = (session?.user as any)?.isPro || false;

  if (status === 'loading' || loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        letterSpacing: '3px',
        fontWeight: '700',
      }}>
        ZENDO...
      </div>
    );
  }

  return (
    <div className="app-container">
      {bannerMessage && (
        <div
          className={`api-status-message ${bannerMessage.type}`}
          style={{ margin: 0, borderRadius: 0, textAlign: 'center', padding: '6px 12px', fontSize: '12px' }}
        >
          {bannerMessage.text}
          <button
            onClick={() => setBannerMessage(null)}
            style={{ background: 'transparent', border: 'none', marginLeft: '12px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            &times;
          </button>
        </div>
      )}

      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPro={() => setIsProOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isPro={isPro}
        userEmail={session?.user?.email || ''}
      />

      <QuickAdd
        onAddTask={handleAddTask}
        placeholder={activeView === 'inbox' ? 'Capture: what needs to be done? (Press Enter)' : `Add task to ${viewTitle}... (Press Enter)`}
      />

      <div className="workspace">
        <Sidebar
          inboxCount={inboxCount}
          activeView={activeView}
          projects={projects}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onSelectInbox={() => {
            setActiveView('inbox');
            setActiveTaskId(null);
          }}
          onSelectProject={(id) => {
            setActiveView(id);
            setActiveTaskId(null);
          }}
          onToggleExpand={handleToggleExpand}
          onAddProject={handleAddProject}
          onAddSubproject={handleAddSubproject}
          onDeleteProject={handleDeleteProject}
          onOrganizeProjects={handleOrganizeProjects}
          isOrganizingProjects={isOrganizingProjects}
        />

        <main className="main-panel">
          <TaskList
            viewTitle={viewTitle}
            isInbox={activeView === 'inbox'}
            tasks={filteredTasks}
            activeTaskId={activeTaskId}
            onSelectTask={(id) => setActiveTaskId(id)}
            onToggleTaskCompleted={handleToggleTaskCompleted}
            onDeleteTask={handleDeleteTask}
            onElaborateInbox={handleElaborateInbox}
            onOrganizeInbox={handleOrganizeInbox}
            isElaboratingInbox={isElaboratingInbox}
            isOrganizingInbox={isOrganizingInbox}
          />

          {activeTaskId && (
            <TaskDetails
              task={activeTask}
              projects={projects}
              onClose={() => setActiveTaskId(null)}
              onUpdateTask={handleUpdateTask}
              onElaborateTask={handleElaborateTask}
              onOrganizeTask={handleOrganizeTask}
              isElaborating={isElaboratingTask}
              isOrganizing={isOrganizingTask}
            />
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenPro={() => setIsProOpen(true)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        userEmail={session?.user?.email || ''}
        isPro={isPro}
      />

      <ProModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
      />
    </div>
  );
}
