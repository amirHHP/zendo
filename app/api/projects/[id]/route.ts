import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = params.id;

  try {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.parentId !== undefined) updateData.parentId = body.parentId;
    if (body.expanded !== undefined) updateData.expanded = !!body.expanded;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    return NextResponse.json({ project: updated });
  } catch (err: any) {
    console.error('Error updating project:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = params.id;

  try {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const parentId = existing.parentId || null;

    // Transaction to safely re-parent subprojects and tasks, then delete project
    await prisma.$transaction([
      // Re-parent children sub-projects
      prisma.project.updateMany({
        where: { parentId: projectId, userId: user.id },
        data: { parentId },
      }),
      // Re-parent or un-assign tasks
      prisma.task.updateMany({
        where: { projectId, userId: user.id },
        data: { projectId: parentId },
      }),
      // Delete the project
      prisma.project.delete({
        where: { id: projectId },
      }),
    ]);

    return NextResponse.json({ success: true, parentId });
  } catch (err: any) {
    console.error('Error deleting project:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
