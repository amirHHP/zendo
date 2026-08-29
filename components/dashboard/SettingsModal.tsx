'use client';

import React, { useState, useEffect } from 'react';
import { UserSettings, GeminiModelInfo } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPro: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  userEmail?: string;
  isPro?: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  onOpenPro,
  settings,
  onSaveSettings,
  userEmail,
  isPro,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [apiModel, setApiModel] = useState(settings.apiModel || 'gemini-2.5-flash');
  const [models, setModels] = useState<GeminiModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey || '');
      setApiModel(settings.apiModel || 'gemini-2.5-flash');
      setStatusMsg(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleFetchModels = async () => {
    setLoadingModels(true);
    setStatusMsg({ text: 'در حال دریافت لیست مدل‌ها...', type: 'info' });

    try {
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در دریافت مدل‌ها');
      }

      setModels(data.models || []);
      setStatusMsg({ text: `${data.models.length} مدل با موفقیت بارگذاری شد.`, type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'خطا در ارتباط با جمینای', type: 'error' });
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveSettings({
        apiKey: apiKey.trim(),
        apiModel,
      });
      onClose();
    } catch (err: any) {
      setStatusMsg({ text: 'خطا در ذخیره تنظیمات', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const selectedModelInfo = models.find((m) => m.name.replace('models/', '') === apiModel);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>تنظیمات (Settings)</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* User Account Info */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '12px' }}>{userEmail || 'کاربر Zendo'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                وضعیت: {isPro ? '🌟 اکانت پرو فعال' : 'نسخه رایگان'}
              </div>
            </div>
            {!isPro && (
              <button
                className="btn-primary"
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => {
                  onClose();
                  onOpenPro();
                }}
              >
                ارتقا به پرو
              </button>
            )}
          </div>

          {/* Gemini API Key */}
          <div className="form-group">
            <label htmlFor="input-api-key">Gemini API Key (اختیاری)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="input-api-key"
                type="password"
                placeholder={settings.hasCentralKey ? 'پیش‌فرض: کلید مرکزی سرور فعال است' : 'AIzaSy...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                dir="ltr"
              />
              <button
                className="btn-primary"
                type="button"
                onClick={handleFetchModels}
                disabled={loadingModels}
                style={{ flexShrink: 0 }}
              >
                {loadingModels ? '...' : 'دریافت'}
              </button>
            </div>
            <small className="help-text">
              {settings.hasCentralKey
                ? 'کلید مرکزی روی سرور تنظیم شده است. می‌توانید کلید اختصاصی خود را نیز برای استفاده نامحدود وارد کنید.'
                : 'برای فعال‌سازی هوش مصنوعی، کلید رایگان Gemini خود را از Google AI Studio وارد کنید.'}
            </small>

            {statusMsg && (
              <div className={`api-status-message ${statusMsg.type}`}>
                {statusMsg.text}
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="form-group">
            <label htmlFor="select-model">مدل هوش مصنوعی (Model)</label>
            <select
              id="select-model"
              value={apiModel}
              onChange={(e) => setApiModel(e.target.value)}
            >
              {models.length > 0 ? (
                models.map((m) => {
                  const cleanVal = m.name.replace('models/', '');
                  return (
                    <option key={cleanVal} value={cleanVal}>
                      {m.displayName || cleanVal}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (پیشنهادی - سریع)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (پیشرفته - تحلیلی)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </>
              )}
            </select>

            {selectedModelInfo && (
              <div className="model-details-card">
                <div className="model-detail-row">
                  <span className="model-detail-label">Context Limit:</span>
                  <span className="model-detail-value">
                    {Number(selectedModelInfo.inputTokenLimit || 1048576).toLocaleString()} tokens
                  </span>
                </div>
                <div className="model-detail-row">
                  <span className="model-detail-label">Output Limit:</span>
                  <span className="model-detail-value">
                    {Number(selectedModelInfo.outputTokenLimit || 8192).toLocaleString()} tokens
                  </span>
                </div>
                {selectedModelInfo.description && (
                  <div style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                    {selectedModelInfo.description}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </div>
    </div>
  );
}
