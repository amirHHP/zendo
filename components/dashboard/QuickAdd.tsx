'use client';

import React, { useState } from 'react';

interface QuickAddProps {
  onAddTask: (text: string) => Promise<void>;
  placeholder?: string;
}

export function QuickAdd({ onAddTask, placeholder }: QuickAddProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      try {
        await onAddTask(trimmed);
        setText('');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="quick-add-section">
      <input
        type="text"
        className="input-quick-add"
        placeholder={placeholder || "Capture: what needs to be done? (Press Enter)"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        autoFocus
        autoComplete="off"
      />
    </section>
  );
}
