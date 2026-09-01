'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTHLY' | 'PRO_YEARLY'>('PRO_MONTHLY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'خطا در اتصال به درگاه زرین‌پال');
      }

      // Redirect to ZarinPal
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'خطا در ارتباط با درگاه');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>ارتقا به اکانت پرو (Zendo Pro)</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
            <span style={{ fontSize: '32px' }}>⚡</span>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginTop: '6px' }}>
              بهره‌وری نامحدود با Zendo Pro
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
              تمام موانع تمرکز را از میان بردارید و ذهن خود را سبک کنید.
            </p>
          </div>

          {/* Feature list */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '14px',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✓</span>
              <span><strong>پروژه‌ها و پوشه‌های نامحدود:</strong> دسته‌بندی عمیق و سلسله‌مراتبی</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✓</span>
              <span><strong>هوش مصنوعی نامحدود:</strong> بدون محدودیت روزانه برای بسط و دسته‌بندی تسک‌ها</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✓</span>
              <span><strong>همگام‌سازی ابری:</strong> دسترسی دائمی از کامپیوتر و گوشی با PWA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✓</span>
              <span><strong>تسک‌های نامحدود</strong> و پشتیبانی اولویت‌دار</span>
            </div>
          </div>

          {/* Plan selector */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <div
              onClick={() => setSelectedPlan('PRO_MONTHLY')}
              style={{
                flex: 1,
                padding: '12px',
                border: `1.5px solid ${selectedPlan === 'PRO_MONTHLY' ? 'var(--text-primary)' : 'var(--border-color)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: selectedPlan === 'PRO_MONTHLY' ? 'var(--bg-hover)' : 'var(--bg-primary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>اشتراک ماهانه</div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
                ۴۹,۰۰۰ <span style={{ fontSize: '11px', fontWeight: 'normal' }}>تومان</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('PRO_YEARLY')}
              style={{
                flex: 1,
                padding: '12px',
                border: `1.5px solid ${selectedPlan === 'PRO_YEARLY' ? 'var(--text-primary)' : 'var(--border-color)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: selectedPlan === 'PRO_YEARLY' ? 'var(--bg-hover)' : 'var(--bg-primary)',
                position: 'relative',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '8px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '3px',
                fontWeight: '700',
              }}>
                ۳۳٪ تخفیف
              </span>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>اشتراک سالانه</div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
                ۳۹۰,۰۰۰ <span style={{ fontSize: '11px', fontWeight: 'normal' }}>تومان</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="api-status-message error" style={{ textAlign: 'center' }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>🔒 پرداخت امن زرین‌پال</span>
          </div>
          <button
            className="btn-primary"
            onClick={handleCheckout}
            disabled={loading}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600' }}
          >
            {loading ? 'در حال اتصال به درگاه...' : 'پرداخت و فعال‌سازی'}
          </button>
        </div>
      </div>
    </div>
  );
}
