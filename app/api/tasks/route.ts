import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text, notes = '', projectId = null, subtasks = [] } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Task text is required' }, { status: 400 });
    }

    // Optional free tier task limit check (e.g. 50 tasks for free user)
    if (!user.isPro) {
      const taskCount = await prisma.task.count({
        where: { userId: user.id, completed: false },
      });
      if (taskCount >= 100) {
        return NextResponse.json(
          { error: 'سقف تسک‌های فعال در نسخه رایگان تکمیل شده است. لطفاً برای تسک‌های نامحدود به پرو ارتقا دهید.' },
          { status: 403 }
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        text: text.trim(),
        notes: notes || '',
        projectId: projectId || null,
        completed: false,
        subtasks: {
          create: Array.isArray(subtasks)
            ? subtasks.map((st: any, idx: number) => ({
                text: typeof st === 'string' ? st : st.text,
                completed: typeof st === 'object' ? !!st.completed : false,
                order: idx,
              }))
            : [],
        },
      },
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating task:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
