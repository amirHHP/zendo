'use client';

import React, { useState, useEffect } from 'react';
import { TaskItem, ProjectItem } from '@/types';
import { playCompletionSound } from '@/lib/audio';

interface TaskDetailsProps {
  task: TaskItem | null;
  projects: ProjectItem[];
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  onElaborateTask: (id: string) => Promise<void>;
  onOrganizeTask: (id: string) => Promise<void>;
  isElaborating: boolean;
  isOrganizing: boolean;
}

export function TaskDetails({
  task,
  projects,
  onClose,
  onUpdateTask,
  onElaborateTask,
  onOrganizeTask,
  isElaborating,
  isOrganizing,
}: TaskDetailsProps) {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState<string>('inbox');
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (task) {
      setText(task.text);
      setNotes(task.notes || '');
      setProjectId(task.projectId || 'inbox');
    }
  }, [task]);

  if (!task) return null;

  const handleTextBlur = () => {
    if (text !== task.text && text.trim()) {
      onUpdateTask(task.id, { text: text.trim() });
    }
  };

  const handleNotesBlur = () => {
    if (notes !== (task.notes || '')) {
      onUpdateTask(task.id, { notes });
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newProjectId = val === 'inbox' ? null : val;
    setProjectId(val);
    onUpdateTask(task.id, { projectId: newProjectId });
  };

  const handleAddSubtask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = newSubtaskText.trim();
      if (!trimmed) return;

      const newSubtask = {
        id: crypto.randomUUID ? crypto.randomUUID() : `st_${Date.now()}`,
        text: trimmed,
        completed: false,
      };

      const updatedSubtasks = [...(task.subtasks || []), newSubtask];
      await onUpdateTask(task.id, { subtasks: updatedSubtasks });
      setNewSubtaskText('');
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      playCompletionSound();
    }
    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !currentCompleted } : st
    );
    await onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
    await onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  // Helper to calculate hierarchy indentation
  const getProjectPrefix = (proj: ProjectItem) => {
    let prefix = '';
    let curr = proj.parentId;
    while (curr) {
      prefix += '— ';
      const parent = projects.find((p) => p.id === curr);
      curr = parent ? parent.parentId : null;
    }
    return prefix;
  };

  return (
    <aside className="details-panel">
      <div className="details-header">
        <h3>Task Details</h3>
        <button className="close-button" onClick={onClose} title="بستن">
          &times;
        </button>
      </div>

      <div className="details-content">
        <div className="form-group">
          <label>Task</label>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextBlur}
          />
        </div>

        <div className="form-group">
          <label>Project</label>
          <select value={projectId} onChange={handleProjectChange}>
            <option value="inbox">Inbox</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {getProjectPrefix(proj) + proj.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            rows={4}
            placeholder="Add details or thoughts..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
          />
        </div>

        <div className="subtasks-section">
          <label>Subtasks</label>
          <div className="subtasks-list">
            {(task.subtasks || []).map((subtask) => (
              <div
                key={subtask.id}
                className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
              >
                <input
                  type="checkbox"
                  className="subtask-checkbox"
                  checked={subtask.completed}
                  onChange={() => handleToggleSubtask(subtask.id, subtask.completed)}
                />
                <span className="subtask-text">{subtask.text}</span>
                <span
                  className="subtask-delete"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  title="حذف زیرتسک"
                >
                  &times;
                </span>
              </div>
            ))}
          </div>

          <input
            type="text"
            className="input-new-subtask"
            placeholder="+ Add subtask..."
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            onKeyDown={handleAddSubtask}
            autoComplete="off"
          />
        </div>

        {/* AI Action buttons for single task */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            className="btn-primary"
            onClick={() => onElaborateTask(task.id)}
            disabled={isElaborating || isOrganizing}
            style={{ flex: 1 }}
          >
            {isElaborating ? '...' : '✨ Elaborate'}
          </button>
          <button
            className="btn-primary"
            onClick={() => onOrganizeTask(task.id)}
            disabled={isElaborating || isOrganizing}
            style={{ flex: 1 }}
          >
            {isOrganizing ? '...' : '📂 Organize'}
          </button>
        </div>
      </div>
    </aside>
  );
}
