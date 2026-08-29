import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    let key = body.key?.trim();

    if (!key) {
      const settings = await prisma.settings.findUnique({ where: { userId: user.id } });
      key = settings?.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    }

    if (!key) {
      return NextResponse.json({ error: 'کلید API مشخص نشده است.' }, { status: 400 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: err.error?.message || response.statusText }, { status: response.status });
    }

    const data = await response.json();
    const models = (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .sort((a: any, b: any) => {
        const isFlashA = a.name.toLowerCase().includes('flash');
        const isFlashB = b.name.toLowerCase().includes('flash');
        if (isFlashA && !isFlashB) return -1;
        if (!isFlashA && isFlashB) return 1;
        return a.displayName.localeCompare(b.displayName);
      });

    return NextResponse.json({ models });
  } catch (err: any) {
    console.error('Fetch models error:', err);
    return NextResponse.json({ error: err.message || 'خطا در دریافت لیست مدل‌ها' }, { status: 500 });
  }
}
