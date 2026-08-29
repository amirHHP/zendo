import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('Error fetching projects:', err);
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
    const { name, parentId = null } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Free tier project limit check (e.g. 5 projects for free users)
    if (!user.isPro) {
      const count = await prisma.project.count({
        where: { userId: user.id },
      });
      if (count >= 5) {
        return NextResponse.json(
          { error: 'سقف ۵ پروژه در نسخه رایگان تکمیل شده است. برای پروژه‌های نامحدود و تو در تو به اکانت پرو ارتقا دهید.' },
          { status: 403 }
        );
      }
    }

    // Verify parent belongs to user if specified
    if (parentId) {
      const parent = await prisma.project.findFirst({
        where: { id: parentId, userId: user.id },
      });
      if (!parent) {
        return NextResponse.json({ error: 'Parent project not found' }, { status: 404 });
      }
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: name.trim(),
        parentId: parentId || null,
        expanded: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating project:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
