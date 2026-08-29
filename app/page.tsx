import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-family)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '800',
          letterSpacing: '4px',
        }}>
          ZENDO
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {session?.user ? (
            <Link
              href="/dashboard"
              className="btn-primary"
              style={{ textDecoration: 'none', padding: '6px 16px' }}
            >
              داشبورد من ↗
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  padding: '6px 12px',
                }}
              >
                ورود
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{ textDecoration: 'none', padding: '6px 14px' }}
              >
                ثبت‌نام رایگان
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        maxWidth: '840px',
        margin: '0 auto',
        padding: '60px 20px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          border: '1px solid var(--border-color)',
          padding: '4px 12px',
          borderRadius: '20px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}>
          MINIMALIST GTD &bull; GEMINI AI &bull; PWA
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 46px)',
          fontWeight: '800',
          lineHeight: '1.3',
          letterSpacing: '-1px',
          marginBottom: '20px',
        }}>
          تمرکز خود را ساده کنید.<br />
          ذهن خود را سبک و منظم کنید.
        </h1>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          lineHeight: '1.7',
          maxWidth: '620px',
          marginBottom: '32px',
        }}>
          زندو یک مدیر وظایف سیاه‌وسفید و مینیمال بر پایه متدولوژی GTD است. بدون حواس‌پرتی تسک‌های خود را ثبت کنید، با ساختار درختی پوشه‌ها آن‌ها را مرتب نمایید و با هوش مصنوعی جمینای پروژه‌ها را به گام‌های عملی تبدیل کنید.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href={session?.user ? "/dashboard" : "/register"}
            className="btn-primary"
            style={{
              textDecoration: 'none',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {session?.user ? 'ورود به داشبورد' : 'شروع رایگان'}
          </Link>
          <Link
            href="/login"
            style={{
              textDecoration: 'none',
              padding: '12px 24px',
              fontSize: '14px',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontWeight: '500',
            }}
          >
            ورود به حساب کاربری
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          width: '100%',
          textAlign: 'right',
          marginTop: '20px',
        }}>
          <div style={{
            padding: '20px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>📥</div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>ثبت سریع در Inbox</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              هر فکری به ذهنتان می‌رسد را بی‌معطلی ثبت کنید و بعداً سر فرصت پردازش و سازماندهی نمایید.
            </p>
          </div>

          <div style={{
            padding: '20px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>✨</div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>هوش مصنوعی Gemini</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              بسط دادن تسک‌ها، اضافه کردن چک‌لیست زیرتسک‌ها و دسته‌بندی خودکار پروژه‌ها با هوش مصنوعی.
            </p>
          </div>

          <div style={{
            padding: '20px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>📱</div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>نصب روی گوشی (PWA)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              به عنوان یک وب‌اپلیکیشن مستقل روی آیفون و اندروید نصب کنید و همه‌جا به تسک‌هایتان دسترسی داشته باشید.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '11px',
        color: 'var(--text-tertiary)',
      }}>
        ZENDO GTD &bull; Minimalist Task Management &bull; 2026
      </footer>
    </div>
  );
}
