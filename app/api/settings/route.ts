import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    const hasCentralKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

    return NextResponse.json({
      settings: {
        apiKey: settings?.apiKey || '',
        apiModel: settings?.apiModel || 'gemini-2.5-flash',
        theme: settings?.theme || 'light',
        dailyAiCount: settings?.dailyAiCount || 0,
        hasCentralKey,
        isPro: user.isPro,
      },
    });
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { apiKey, apiModel, theme } = body;

    const data: any = {};
    if (apiKey !== undefined) data.apiKey = apiKey.trim();
    if (apiModel !== undefined) data.apiModel = apiModel.trim();
    if (theme !== undefined) data.theme = theme;

    const updated = await prisma.settings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({
      settings: {
        apiKey: updated.apiKey || '',
        apiModel: updated.apiModel,
        theme: updated.theme,
        hasCentralKey: !!process.env.GEMINI_API_KEY,
        isPro: user.isPro,
      },
    });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
