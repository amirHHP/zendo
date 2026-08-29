'use client';

import React from 'react';
import { TaskItem } from '@/types';
import { playCompletionSound } from '@/lib/audio';

interface TaskListProps {
  viewTitle: string;
  isInbox: boolean;
  tasks: TaskItem[];
  activeTaskId: string | null;
  onSelectTask: (id: string) => void;
  onToggleTaskCompleted: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onElaborateInbox: () => void;
  onOrganizeInbox: () => void;
  isElaboratingInbox: boolean;
  isOrganizingInbox: boolean;
}

export function TaskList({
  viewTitle,
  isInbox,
  tasks,
  activeTaskId,
  onSelectTask,
  onToggleTaskCompleted,
  onDeleteTask,
  onElaborateInbox,
  onOrganizeInbox,
  isElaboratingInbox,
  isOrganizingInbox,
}: TaskListProps) {
  // Sort: uncompleted first, then newest first
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });

  const hasIncompleteInboxTasks = isInbox && tasks.some((t) => !t.completed);

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>{viewTitle}</h2>
        {isInbox && hasIncompleteInboxTasks && (
          <div className="list-actions">
            <button
              className="btn-primary"
              onClick={onElaborateInbox}
              disabled={isElaboratingInbox || isOrganizingInbox}
            >
              {isElaboratingInbox ? 'در حال بسط دادن...' : 'Elaborate'}
            </button>
            <button
              className="btn-primary"
              onClick={onOrganizeInbox}
              disabled={isElaboratingInbox || isOrganizingInbox}
            >
              {isOrganizingInbox ? 'در حال سازماندهی...' : 'Organize'}
            </button>
          </div>
        )}
      </div>

      {sortedTasks.length === 0 ? (
        <div className="help-text" style={{ padding: '30px 10px', textAlign: 'center' }}>
          {isInbox ? 'Inbox خالی است. تسک جدیدی در بالا اضافه کنید!' : 'هیچ تسکی در این پروژه وجود ندارد.'}
        </div>
      ) : (
        <div className="task-list">
          {sortedTasks.map((task) => {
            const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
            const totalSubtasks = (task.subtasks || []).length;

            return (
              <div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''} ${
                  activeTaskId === task.id ? 'active' : ''
                }`}
                data-id={task.id}
              >
                <div className="task-main-row">
                  <div className="task-checkbox-container">
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (!task.completed) {
                          playCompletionSound();
                        }
                        onToggleTaskCompleted(task);
                      }}
                    />
                  </div>

                  <span
                    className="task-text"
                    onClick={() => onSelectTask(task.id)}
                  >
                    {task.text}
                    {totalSubtasks > 0 && (
                      <span className="subtask-counter" style={{ marginRight: '8px', fontSize: '11px' }}>
                        [{completedSubtasks}/{totalSubtasks}]
                      </span>
                    )}
                  </span>

                  <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="text-button danger"
                      onClick={() => onDeleteTask(task.id)}
                      title="حذف تسک"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
