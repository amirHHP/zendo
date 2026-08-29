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

  const taskId = params.id;

  try {
    // Ensure task belongs to user
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
      include: { subtasks: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.text !== undefined) updateData.text = body.text;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.projectId !== undefined) updateData.projectId = body.projectId;
    if (body.completed !== undefined) {
      updateData.completed = body.completed;
      updateData.completedAt = body.completed ? new Date() : null;
    }

    // Handle subtasks replacement/sync if provided
    if (body.subtasks !== undefined && Array.isArray(body.subtasks)) {
      await prisma.subtask.deleteMany({
        where: { taskId },
      });

      updateData.subtasks = {
        create: body.subtasks.map((st: any, idx: number) => ({
          text: typeof st === 'string' ? st : st.text,
          completed: typeof st === 'object' ? !!st.completed : false,
          order: idx,
        })),
      };
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        subtasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ task: updated });
  } catch (err: any) {
    console.error('Error updating task:', err);
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

  const taskId = params.id;

  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting task:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
