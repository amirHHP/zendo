'use client';

import React from 'react';
import { useTheme } from '@/components/Providers';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenPro: () => void;
  onToggleMobileMenu: () => void;
  isPro?: boolean;
  userEmail?: string;
}

export function Header({
  onOpenSettings,
  onOpenPro,
  onToggleMobileMenu,
  isPro,
  userEmail,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-nav-toggle"
          onClick={onToggleMobileMenu}
          title="منو"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Link href="/dashboard" className="logo">
          ZENDO
        </Link>
        {isPro ? (
          <span className="pro-badge">PRO</span>
        ) : (
          <button className="pro-upgrade-btn" onClick={onOpenPro}>
            ⚡ ارتقا به پرو
          </button>
        )}
      </div>

      <div className="header-actions">
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? '☀️ روشن' : '🌙 تاریک'}
        </button>

        <button
          className="btn-icon"
          onClick={onOpenSettings}
          title="تنظیمات"
        >
          ⚙️ تنظیمات
        </button>

        <button
          className="btn-icon"
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="خروج از حساب"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
